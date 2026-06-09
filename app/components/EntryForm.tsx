"use client";

import { useState } from "react";

interface Metric {
  id: number;
  name: string;
  unit: string;
  type: string;
  color: string;
}

interface Props {
  projectId: number;
  metrics: Metric[];
  color: string;
  onSubmit: () => void;
}

export default function EntryForm({ projectId, metrics, color, onSubmit }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [values, setValues] = useState<Record<number, string>>({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const numericValues: Record<number, number> = {};
    for (const m of metrics) {
      const v = parseFloat(values[m.id] || "0");
      numericValues[m.id] = isNaN(v) ? 0 : v;
    }

    const res = await fetch(`/api/projects/${projectId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, note: note || null, values: numericValues }),
    });

    if (res.ok) {
      setMessage({ text: "Entry saved! ✓", ok: true });
      setTimeout(() => { onSubmit(); }, 600);
    } else {
      setMessage({ text: "Failed to save", ok: false });
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 space-y-4 border fade-in"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: color + "33" }}
    >
      <h2 className="font-semibold text-white text-sm">Log Entry</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        {/* Metric inputs */}
        {metrics.map(m => (
          <div key={m.id} className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: m.color }}>
              {m.name} {m.unit ? `(${m.unit})` : ""}
            </label>
            <input
              type="number"
              step={m.type === "integer" ? "1" : "0.01"}
              min="0"
              placeholder={m.type === "currency" ? "0.00" : "0"}
              value={values[m.id] || ""}
              onChange={e => setValues(prev => ({ ...prev, [m.id]: e.target.value }))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-700 focus:outline-none transition-colors text-sm"
              style={{ borderColor: values[m.id] ? m.color + "66" : undefined }}
            />
          </div>
        ))}
      </div>

      {/* Note */}
      <input
        type="text"
        placeholder="Add a note (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 hover:opacity-90"
          style={{ background: color }}
        >
          {loading ? "Saving…" : "Save Entry"}
        </button>
        {message && (
          <span className={`text-sm ${message.ok ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
