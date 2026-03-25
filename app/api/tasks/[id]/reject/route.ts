import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { comment } = await req.json();

  const task = await prisma.task.update({
    where: { id },
    data: {
      status: "todo",
      adminComment: comment || null,
    },
    include: { assignedTo: true },
  });

  // Notify assignee
  await prisma.notification.create({
    data: {
      memberId: task.assignedToId,
      message: `❌ تم رفض مهمتك "${task.title}"${comment ? `: ${comment}` : ""}`,
      taskId: task.id,
    },
  });

  return NextResponse.json(task);
}
