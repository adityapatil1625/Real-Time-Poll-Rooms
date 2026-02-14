"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type PollOption = {
  id: string;
  text: string;
};

type Poll = {
  id: string;
  question: string;
  options: PollOption[];
};

type ResultsResponse = {
  total: number;
  options: Array<{ id: string; text: string; votes: number }>;
};

const POLL_INTERVAL_MS = 2000;

function getDeviceId() {
  if (typeof window === "undefined") {
    return "";
  }
  const key = "poll_device_id";
  const stored = window.localStorage.getItem(key);
  if (stored) {
    return stored;
  }
  const generated = window.crypto.randomUUID();
  window.localStorage.setItem(key, generated);
  return generated;
}

export default function PollPage() {
  const params = useParams();
  const pollId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingVote, setLoadingVote] = useState(false);

  const loadPoll = useCallback(async () => {
    if (!pollId) {
      return;
    }
    const response = await fetch(`/api/polls/${pollId}`);
    if (!response.ok) {
      setStatus("Poll not found.");
      return;
    }
    const data = (await response.json()) as Poll;
    setPoll(data);
  }, [pollId]);

  const loadResults = useCallback(async () => {
    if (!pollId) {
      return;
    }
    const response = await fetch(`/api/polls/${pollId}/results`);
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as ResultsResponse;
    setResults(data);
  }, [pollId]);

  useEffect(() => {
    loadPoll();
  }, [loadPoll]);

  useEffect(() => {
    loadResults();
    const interval = window.setInterval(loadResults, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [loadResults]);

  const handleVote = async (optionId: string) => {
    if (!pollId) {
      return;
    }
    setStatus(null);
    setLoadingVote(true);

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId,
          deviceId: getDeviceId()
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to vote.");
      }

      setStatus("Vote counted.");
      await loadResults();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to vote.";
      setStatus(message);
    } finally {
      setLoadingVote(false);
    }
  };

  const totalVotes = results?.total ?? 0;
  const sortedResults = useMemo(() => results?.options ?? [], [results]);

  return (
    <main className="page">
      <section className="card">
        {!poll && <p className="muted">Loading poll...</p>}
        {poll && (
          <>
            <h1 className="title">{poll.question}</h1>
            <p className="subtitle">Total votes: {totalVotes}</p>
            <div className="options">
              {poll.options.map((option) => {
                const result = sortedResults.find((item) => item.id === option.id);
                const votes = result?.votes ?? 0;
                const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                return (
                  <div className="option" key={option.id}>
                    <div>
                      <div>{option.text}</div>
                      <div className="muted">{votes} votes · {percent}%</div>
                    </div>
                    <div className="progress">
                      <div style={{ width: `${percent}%` }} />
                    </div>
                    <button
                      className="btn"
                      onClick={() => handleVote(option.id)}
                      disabled={loadingVote}
                      type="button"
                    >
                      Vote
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {status && <div className="notice">{status}</div>}
      </section>
    </main>
  );
}
