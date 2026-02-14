import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.question !== "string" || !Array.isArray(body.options)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const question = body.question.trim();
  const options = body.options
    .map((option: string) => (typeof option === "string" ? option.trim() : ""))
    .filter((option: string) => option.length > 0);

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (options.length < 2) {
    return NextResponse.json({ error: "At least two options are required." }, { status: 400 });
  }

  const poll = await prisma.poll.create({
    data: {
      question,
      options: {
        create: options.map((text: string) => ({ text }))
      }
    }
  });

  return NextResponse.json({ pollId: poll.id });
}
