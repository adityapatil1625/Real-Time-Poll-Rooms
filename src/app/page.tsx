"use client";

import { useMemo, useState } from "react";

type CreateResponse = {
  pollId: string;
};

const MIN_OPTIONS = 2;

function normalizeOptions(options: string[]) {
  return options.map((option) => option.trim()).filter((option) => option.length > 0);
}

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pollId, setPollId] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (!pollId || typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/polls/${pollId}`;
  }, [pollId]);

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === index ? value : opt)));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) {
      return;
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const cleanedQuestion = question.trim();
    const cleanedOptions = normalizeOptions(options);

    if (!cleanedQuestion) {
      setError("Please enter a question.");
      setLoading(false);
      return;
    }

    if (cleanedOptions.length < MIN_OPTIONS) {
      setError("Please provide at least two options.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: cleanedQuestion,
          options: cleanedOptions
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to create poll.");
      }

      const data = (await response.json()) as CreateResponse;
      setPollId(data.pollId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1 className="title">Create a live poll</h1>
        <p className="subtitle">Share the link and watch results update automatically.</p>

        <div className="field">
          <label htmlFor="question">Question</label>
          <input
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we build next?"
          />
        </div>

        <div className="options">
          {options.map((option, index) => (
            <div className="field" key={`option-${index}`}>
              <label htmlFor={`option-${index}`}>Option {index + 1}</label>
              <div className="row">
                <input
                  id={`option-${index}`}
                  value={option}
                  onChange={(event) => handleOptionChange(index, event.target.value)}
                  placeholder="Enter an option"
                />
                <button
                  className="btn secondary"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= MIN_OPTIONS}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <button className="btn secondary" onClick={addOption} type="button">
            Add option
          </button>
          <button className="btn" onClick={handleSubmit} disabled={loading} type="button">
            {loading ? "Creating..." : "Create poll"}
          </button>
        </div>

        {error && <div className="notice">{error}</div>}

        {pollId && (
          <div className="notice">
            <div>Share this link:</div>
            <div className="muted">{shareUrl}</div>
          </div>
        )}
      </section>
    </main>
  );
}
