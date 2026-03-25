import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Verify PIN (for profile selection)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });

  const member = await prisma.member.findFirst({
    where: { id, userId: session.userId },
  });

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const valid = await bcrypt.compare(pin, member.pinHash);
  if (!valid) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });

  return NextResponse.json({ success: true, member });
}

// Change PIN (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });

  const pinHash = await bcrypt.hash(pin, 10);

  await prisma.member.update({
    where: { id },
    data: { pinHash },
  });

  return NextResponse.json({ success: true });
}
