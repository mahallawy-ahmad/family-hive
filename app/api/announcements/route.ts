import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");

  const userMembers = await prisma.member.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const memberIds = userMembers.map((m) => m.id);

  const announcements = await prisma.announcement.findMany({
    where: { createdById: { in: memberIds } },
    include: {
      createdBy: { select: { id: true, name: true, color: true, avatar: true } },
      reads: memberId ? { where: { memberId } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  const result = announcements.map((a) => ({
    ...a,
    isRead: memberId ? a.reads.length > 0 : false,
    reads: undefined,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, createdById } = await req.json();

  if (!title || !content || !createdById) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: { title, content, createdById },
    include: {
      createdBy: { select: { id: true, name: true, color: true, avatar: true } },
    },
  });

  // Notify all family members
  const allMembers = await prisma.member.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: allMembers
      .filter((m) => m.id !== createdById)
      .map((m) => ({
        memberId: m.id,
        message: `📢 إعلان جديد: "${title}"`,
      })),
  });

  return NextResponse.json(announcement);
}
