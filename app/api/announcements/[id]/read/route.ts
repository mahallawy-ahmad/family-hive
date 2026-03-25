import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { memberId } = await req.json();

  await prisma.announcementRead.upsert({
    where: {
      announcementId_memberId: { announcementId: id, memberId },
    },
    create: { announcementId: id, memberId },
    update: {},
  });

  return NextResponse.json({ success: true });
}
