import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const poll = await prisma.poll.findUnique({ where: { id: params.id } });
  if (!poll) {
    return NextResponse.json({ error: "Poll not found." }, { status: 404 });
  }

  const options = await prisma.option.findMany({
    where: { pollId: params.id },
    include: {
      _count: {
        select: { votes: true }
      }
    },
    orderBy: { id: "asc" }
  });

  const total = options.reduce((sum, option) => sum + option._count.votes, 0);

  return NextResponse.json({
    total,
    options: options.map((option) => ({
      id: option.id,
      text: option.text,
      votes: option._count.votes
    }))
  });
}
