import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints, updateStreak, getNextRecurringDate } from "@/lib/gamification";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { assignedTo: true },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (task.status !== "done") {
    return NextResponse.json({ error: "Task must be done first" }, { status: 400 });
  }

  const member = task.assignedTo;

  // Calculate streak
  const { newStreak, streakBonus } = updateStreak(
    member.currentStreak,
    member.lastTaskDate ? new Date(member.lastTaskDate) : null
  );

  // Calculate points
  const proposalBonus = task.isProposed ? 15 : 0;
  const finalPoints = calculatePoints(
    task.baseReward + proposalBonus,
    member.pointMultiplier,
    streakBonus
  );

  // Update task status
  await prisma.task.update({
    where: { id: task.id },
    data: { status: "approved" },
  });

  // Update member points + streak
  await prisma.member.update({
    where: { id: member.id },
    data: {
      walletBalance: member.walletBalance + finalPoints,
      lifetimePoints: member.lifetimePoints + finalPoints,
      currentStreak: newStreak,
      lastTaskDate: new Date(),
    },
  });

  // Record transaction
  await prisma.transaction.create({
    data: {
      memberId: member.id,
      type: "earned",
      amount: finalPoints,
      description: `تم اعتماد مهمة: ${task.title}`,
      taskId: task.id,
    },
  });

  // Notify assignee
  await prisma.notification.create({
    data: {
      memberId: member.id,
      message: `🎉 تم اعتماد مهمتك "${task.title}" وحصلت على ${finalPoints} نقطة!`,
      taskId: task.id,
    },
  });

  // Generate next recurring task if applicable
  if (task.isRecurring && task.recurringType) {
    const nextDate = getNextRecurringDate(new Date(), task.recurringType as "daily" | "weekly" | "monthly");
    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        assignedToId: task.assignedToId,
        createdById: task.createdById,
        category: task.category,
        priority: task.priority,
        baseReward: task.baseReward,
        dueDate: nextDate,
        dueTime: task.dueTime,
        isRecurring: true,
        recurringType: task.recurringType,
      },
    });
  }

  return NextResponse.json({ success: true, pointsEarned: finalPoints });
}
