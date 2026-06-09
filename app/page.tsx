"use client";

import { useEffect, useState, useCallback } from "react";
import EntryForm from "./components/EntryForm";
import TotalsCard from "./components/TotalsCard";
import SalesChart from "./components/SalesChart";

interface Summary {
  totals: { sales: number; customers: number };
  series: { date: string; sales: number; customers: number }[];
}

export default function Home() {
  const [summary, setSummary] = useState<Summary>({
    totals: { sales: 0, customers: 0 },
    series: [],
  });

  const fetchSummary = useCallback(async () => {
    const res = await fetch("/api/summary");
    if (res.ok) {
      const data = await res.json();
      setSummary(data);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏋️</span>
        <div>
          <h1 className="text-3xl font-bold text-white">Gym Daily Logger</h1>
          <p className="text-gray-400 text-sm">Track daily sales & customer counts</p>
        </div>
      </div>

      {/* Entry Form */}
      <EntryForm onSubmit={fetchSummary} />

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TotalsCard
          label="Total Revenue (all time)"
          value={`£${summary.totals.sales.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          icon="💷"
        />
        <TotalsCard
          label="Total Customers (all time)"
          value={summary.totals.customers.toLocaleString("en-GB")}
          icon="👥"
        />
      </div>

      {/* Chart */}
      <SalesChart data={summary.series} />

      {/* Recent entries table */}
      {summary.series.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Entries</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left pb-2">Date</th>
                <th className="text-right pb-2">Sales (£)</th>
                <th className="text-right pb-2">Customers</th>
              </tr>
            </thead>
            <tbody>
              {[...summary.series].reverse().slice(0, 10).map((row) => (
                <tr key={row.date} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 text-gray-300">{row.date}</td>
                  <td className="py-2 text-right text-indigo-400">
                    £{row.sales.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 text-right text-emerald-400">{row.customers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
