import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/seed — one-time setup: create admin user + default rewards
export async function POST(req: NextRequest) {
  const { email, password, adminName } = await req.json();

  if (!email || !password || !adminName) {
    return NextResponse.json({ error: "email, password, adminName required" }, { status: 400 });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const pinHash = await bcrypt.hash("0000", 10); // default PIN

  // Create user + admin member
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      members: {
        create: {
          name: adminName,
          role: "admin",
          color: "#FF6B6B",
          avatar: "👑",
          pinHash,
        },
      },
    },
    include: { members: true },
  });

  // Create default rewards (only if none exist)
  const rewardCount = await prisma.reward.count();
  if (rewardCount === 0) {
    await prisma.reward.createMany({
      data: [
        { title: "حلوى", icon: "🍬", costInCredits: 30, description: "علبة حلوى من اختيارك" },
        { title: "وقت شاشة إضافي", icon: "🕐", costInCredits: 50, description: "ساعة إضافية" },
        { title: "تخطي مهمة", icon: "⏭️", costInCredits: 100, description: "تخطي مهمة واحدة" },
        { title: "لعبة", icon: "🎮", costInCredits: 150, description: "لعبة صغيرة" },
        { title: "رحلة", icon: "✈️", costInCredits: 200, description: "رحلة عائلية" },
        { title: "عشاء برا", icon: "🍕", costInCredits: 250, description: "عشاء في مطعم" },
        { title: "نقود جيب", icon: "💰", costInCredits: 300, description: "مصروف إضافي" },
      ],
    });
  }

  return NextResponse.json({ success: true, userId: user.id, memberId: user.members[0].id });
}
