"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

interface Metric {
  id: number;
  name: string;
  unit: string;
  type: string;
  color: string;
}

interface Props {
  data: Record<string, unknown>[];
  metrics: Metric[];
}

export default function TrackerChart({ data, metrics }: Props) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  if (data.length === 0) return null;

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#13131f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" },
    labelStyle: { color: "#f1f5f9", fontWeight: 600 },
    itemStyle: { color: "#94a3b8" },
  };

  return (
    <div className="rounded-2xl border border-white/5 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-white">Trends</h2>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === "line" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === "bar" ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}
          >
            Bar
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {chartType === "line" ? (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            {metrics.map(m => (
              <Line
                key={m.id}
                type="monotone"
                dataKey={m.name}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 3, fill: m.color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
            <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            {metrics.map(m => (
              <Bar key={m.id} dataKey={m.name} fill={m.color} radius={[4, 4, 0, 0]} opacity={0.85} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
