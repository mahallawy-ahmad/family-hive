import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { memberId } = await req.json();
  if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

  const [reward, member] = await Promise.all([
    prisma.reward.findUnique({ where: { id } }),
    prisma.member.findUnique({ where: { id: memberId } }),
  ]);

  if (!reward || !reward.isAvailable) {
    return NextResponse.json({ error: "Reward not available" }, { status: 404 });
  }
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  if (member.walletBalance < reward.costInCredits) {
    return NextResponse.json({ error: "رصيدك غير كافٍ" }, { status: 400 });
  }

  // Deduct credits and record transaction
  await prisma.member.update({
    where: { id: memberId },
    data: { walletBalance: member.walletBalance - reward.costInCredits },
  });

  await prisma.transaction.create({
    data: {
      memberId,
      type: "spent",
      amount: reward.costInCredits,
      description: `اشترى مكافأة: ${reward.title} ${reward.icon}`,
      rewardId: reward.id,
    },
  });

  // Notify admins/parents
  const adminMembers = await prisma.member.findMany({
    where: { userId: session.userId, role: { in: ["admin", "parent"] } },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: adminMembers
      .filter((m) => m.id !== memberId)
      .map((m) => ({
        memberId: m.id,
        message: `🛍️ ${member.name} اشترى: ${reward.title} ${reward.icon} بـ ${reward.costInCredits} نقطة`,
      })),
  });

  return NextResponse.json({ success: true, newBalance: member.walletBalance - reward.costInCredits });
}
