"use client";

import { useState } from "react";

const ICONS = ["📊", "🏋️", "💰", "🏃", "📚", "🎯", "💡", "🍎", "💻", "🎵", "🌿", "⚡", "🔥", "🧘", "🏆"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6",
];

const METRIC_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#22c55e", "#14b8a6", "#06b6d4"];

interface MetricDraft {
  name: string;
  unit: string;
  type: "number" | "currency" | "integer";
  color: string;
}

export default function CreateProjectModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📊");
  const [color, setColor] = useState("#6366f1");
  const [metrics, setMetrics] = useState<MetricDraft[]>([
    { name: "", unit: "", type: "number", color: "#6366f1" },
  ]);
  const [loading, setLoading] = useState(false);

  const addMetric = () => {
    setMetrics(prev => [...prev, {
      name: "",
      unit: "",
      type: "number",
      color: METRIC_COLORS[prev.length % METRIC_COLORS.length],
    }]);
  };

  const updateMetric = (i: number, field: keyof MetricDraft, value: string) => {
    setMetrics(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const removeMetric = (i: number) => {
    setMetrics(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validMetrics = metrics.filter(m => m.name.trim());
    if (validMetrics.length === 0) return;

    setLoading(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), icon, color, metrics: validMetrics }),
    });
    setLoading(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl fade-in" style={{ background: "#13131f" }}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Create New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Project Name</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Gym Tracker, Book Log, Sales..."
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === i ? "ring-2 ring-indigo-500 bg-white/10" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#13131f] scale-110" : ""}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-400">Metrics to Track</label>
              <button type="button" onClick={addMetric} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add metric</button>
            </div>
            <div className="space-y-3">
              {metrics.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 cursor-pointer"
                    style={{ background: m.color }}
                    onClick={() => {
                      const next = METRIC_COLORS[(METRIC_COLORS.indexOf(m.color) + 1) % METRIC_COLORS.length];
                      updateMetric(i, "color", next);
                    }}
                  />
                  <input
                    value={m.name}
                    onChange={e => updateMetric(i, "name", e.target.value)}
                    placeholder="Metric name (e.g. Sales)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    value={m.unit}
                    onChange={e => updateMetric(i, "unit", e.target.value)}
                    placeholder="Unit (e.g. £, kg)"
                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={m.type}
                    onChange={e => updateMetric(i, "type", e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="number">Decimal</option>
                    <option value="integer">Whole</option>
                    <option value="currency">Currency</option>
                  </select>
                  {metrics.length > 1 && (
                    <button type="button" onClick={() => removeMetric(i)} className="text-slate-500 hover:text-red-400 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-xs text-slate-500 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: color + "33" }}>
                {icon}
              </div>
              <div>
                <p className="font-medium text-white">{name || "My Project"}</p>
                <p className="text-xs text-slate-500">{metrics.filter(m => m.name).map(m => m.name).join(", ") || "No metrics yet"}</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50"
            style={{ background: color }}
          >
            {loading ? "Creating…" : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
