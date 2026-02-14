import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const poll = await prisma.poll.findUnique({
    where: { id: params.id },
    include: {
      options: {
        orderBy: { id: "asc" }
      }
    }
  });

  if (!poll) {
    return NextResponse.json({ error: "Poll not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.text
    }))
  });
}
