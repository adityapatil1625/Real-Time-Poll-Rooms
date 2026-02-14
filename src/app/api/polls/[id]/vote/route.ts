import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOLDOWN_MS = 30 * 1000; // 30 seconds between votes from same IP
const MAX_VOTES_PER_IP = 10; // Max votes per IP per poll

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => null);
  const optionId = body?.optionId;
  const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim() : "";

  if (!optionId || !deviceId) {
    return NextResponse.json({ error: "Missing vote details." }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({ where: { id: params.id } });
  if (!poll) {
    return NextResponse.json({ error: "Poll not found." }, { status: 404 });
  }

  const option = await prisma.option.findFirst({
    where: { id: optionId, pollId: params.id }
  });

  if (!option) {
    return NextResponse.json({ error: "Option not found." }, { status: 404 });
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      pollId_deviceId: {
        pollId: params.id,
        deviceId
      }
    }
  });

  if (existingVote) {
    return NextResponse.json({ error: "This device already voted." }, { status: 409 });
  }

  const ip = getClientIp(request);
  if (ip !== "unknown") {
    // Check rate limit: max votes per IP per poll
    const ipVoteCount = await prisma.vote.count({
      where: {
        pollId: params.id,
        ip
      }
    });

    if (ipVoteCount >= MAX_VOTES_PER_IP) {
      return NextResponse.json(
        { error: "Too many votes from this network." },
        { status: 429 }
      );
    }

    // Check cooldown: prevent rapid voting from same IP
    const recentVote = await prisma.vote.findFirst({
      where: {
        pollId: params.id,
        ip,
        createdAt: {
          gte: new Date(Date.now() - COOLDOWN_MS)
        }
      }
    });

    if (recentVote) {
      return NextResponse.json(
        { error: "Please wait a few minutes before voting again from this network." },
        { status: 429 }
      );
    }
  }

  await prisma.vote.create({
    data: {
      pollId: params.id,
      optionId: option.id,
      deviceId,
      ip
    }
  });

  return NextResponse.json({ ok: true });
}
