"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  sales: number;
  customers: number;
}

interface SalesChartProps {
  data: DataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-64 text-gray-500">
        No data yet — log some days above!
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Trends Over Time</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" stroke="#818CF8" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#34D399" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
            labelStyle={{ color: "#F9FAFB" }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            name="Sales (£)"
            stroke="#818CF8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="customers"
            name="Customers"
            stroke="#34D399"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
