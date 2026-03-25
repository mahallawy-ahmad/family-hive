import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canPrestige, PRESTIGE_THRESHOLD } from "@/lib/gamification";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  if (!canPrestige(member.lifetimePoints)) {
    return NextResponse.json(
      { error: `تحتاج ${PRESTIGE_THRESHOLD} نقطة لتفعيل الارتقاء` },
      { status: 400 }
    );
  }

  const updated = await prisma.member.update({
    where: { id },
    data: {
      prestigeLevel: member.prestigeLevel + 1,
      pointMultiplier: Math.round((member.pointMultiplier + 0.05) * 100) / 100,
      lifetimePoints: 0,
    },
  });

  // Record prestige transaction
  await prisma.transaction.create({
    data: {
      memberId: id,
      type: "prestige_reset",
      amount: 0,
      description: `ارتقاء إلى المستوى ${updated.prestigeLevel} 🚀`,
    },
  });

  // Notify all family members
  const allMembers = await prisma.member.findMany({
    where: { userId: member.userId },
  });

  await prisma.notification.createMany({
    data: allMembers.map((m) => ({
      memberId: m.id,
      message: `🌟 ${member.name} وصل للمستوى ${updated.prestigeLevel} في الارتقاء!`,
    })),
  });

  return NextResponse.json(updated);
}
