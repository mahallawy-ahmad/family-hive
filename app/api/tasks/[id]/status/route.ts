import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();
  if (!status) return NextResponse.json({ error: "Status required" }, { status: 400 });

  const task = await prisma.task.update({
    where: { id },
    data: { status },
    include: {
      assignedTo: true,
    },
  });

  // If moved to "done", notify admin/parent members
  if (status === "done") {
    const userMembers = await prisma.member.findMany({
      where: { userId: session.userId, role: { in: ["admin", "parent"] } },
    });

    await prisma.notification.createMany({
      data: userMembers.map((m) => ({
        memberId: m.id,
        message: `✅ "${task.title}" بانتظار اعتمادك من ${task.assignedTo.name}`,
        taskId: task.id,
      })),
    });
  }

  return NextResponse.json(task);
}
