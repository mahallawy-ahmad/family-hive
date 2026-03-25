import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rewards = await prisma.reward.findMany({
    orderBy: { costInCredits: "asc" },
  });

  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, costInCredits, icon } = await req.json();

  if (!title || !costInCredits || !icon) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const reward = await prisma.reward.create({
    data: { title, description: description || null, costInCredits, icon },
  });

  return NextResponse.json(reward);
}
