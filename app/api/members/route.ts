import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.member.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, role, color, avatar, pin } = body;

  if (!name || !role || !color || !pin) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const member = await prisma.member.create({
    data: {
      userId: session.userId,
      name,
      role,
      color,
      avatar: avatar || null,
      pinHash,
    },
  });

  return NextResponse.json(member);
}
