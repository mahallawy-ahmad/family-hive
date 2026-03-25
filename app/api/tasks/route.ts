import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("memberId");
  const all = searchParams.get("all"); // admin: get all tasks

  // Get all members for this user to validate ownership
  const userMembers = await prisma.member.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const memberIds = userMembers.map((m) => m.id);

  let where: Record<string, unknown> = {};
  if (all === "true") {
    where = { assignedToId: { in: memberIds } };
  } else if (memberId) {
    if (!memberIds.includes(memberId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    where = { assignedToId: memberId };
  } else {
    where = { assignedToId: { in: memberIds } };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true, color: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title, description, assignedToId, createdById, category,
    priority, baseReward, isProposed, dueDate, dueTime,
    isRecurring, recurringType,
  } = body;

  if (!title || !assignedToId || !createdById || !category || !priority) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      assignedToId,
      createdById,
      category,
      priority,
      baseReward: baseReward ?? (priority === "low" ? 10 : priority === "medium" ? 30 : 50),
      isProposed: isProposed ?? false,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime || null,
      isRecurring: isRecurring ?? false,
      recurringType: recurringType || null,
    },
    include: {
      assignedTo: { select: { id: true, name: true, color: true, avatar: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Send notification to assignee (if not assigning to yourself)
  if (assignedToId !== createdById) {
    const creator = await prisma.member.findUnique({ where: { id: createdById } });
    await prisma.notification.create({
      data: {
        memberId: assignedToId,
        message: `📋 تم إسناد مهمة جديدة لك: "${title}" من ${creator?.name || "شخص ما"}`,
        taskId: task.id,
      },
    });
  }

  return NextResponse.json(task);
}
