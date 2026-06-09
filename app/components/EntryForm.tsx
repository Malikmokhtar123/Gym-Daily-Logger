"use client";

import { useState } from "react";

interface EntryFormProps {
  onSubmit: () => void;
}

export default function EntryForm({ onSubmit }: EntryFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [sales, setSales] = useState("");
  const [customers, setCustomers] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        sales: parseFloat(sales),
        customers: parseInt(customers, 10),
      }),
    });

    if (res.ok) {
      setMessage({ text: "Entry saved!", ok: true });
      onSubmit();
    } else {
      const err = await res.json();
      setMessage({ text: err.error || "Failed to save", ok: false });
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-800"
    >
      <h2 className="text-lg font-semibold text-white">Log Daily Numbers</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Sales (£)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 1250.00"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            required
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">Customers</label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 85"
            value={customers}
            onChange={(e) => setCustomers(e.target.value)}
            required
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          {loading ? "Saving…" : "Save Entry"}
        </button>
        {message && (
          <span className={message.ok ? "text-green-400" : "text-red-400"}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
