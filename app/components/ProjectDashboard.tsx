"use client";

import { useEffect, useState, useCallback } from "react";
import TrackerChart from "./TrackerChart";
import EntryForm from "./EntryForm";

interface Metric {
  id: number;
  project_id: number;
  name: string;
  unit: string;
  type: string;
  color: string;
}

interface EntryMetric {
  name: string;
  value: number;
  unit: string;
  color: string;
  metricId: number;
}

interface Entry {
  id: number;
  project_id: number;
  date: string;
  note: string | null;
  created_at: string;
  metrics: EntryMetric[];
}

interface Project {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Props {
  project: Project;
  onRefresh: () => void;
  onDelete: () => void;
  onUpdate: (updated: Partial<Project>) => void;
}

function formatValue(value: number, type: string, unit: string) {
  if (type === "currency") return `${unit}${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (type === "integer") return `${value.toLocaleString("en-GB")}${unit ? " " + unit : ""}`;
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2 })}${unit ? " " + unit : ""}`;
}

export default function ProjectDashboard({ project, onRefresh, onDelete, onUpdate }: Props) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [metricsRes, entriesRes] = await Promise.all([
      fetch(`/api/projects/${project.id}/metrics`),
      fetch(`/api/projects/${project.id}/entries`),
    ]);
    if (metricsRes.ok) setMetrics(await metricsRes.json());
    if (entriesRes.ok) {
      const data = await entriesRes.json();
      setEntries(data.entries);
      setStreak(data.streak);
    }
    setLoading(false);
  }, [project.id]);

  useEffect(() => {
    fetchData();
    setNameInput(project.name);
    setEditingName(false);
    setShowForm(false);
  }, [project.id, fetchData]);

  const handleSaveName = async () => {
    if (!nameInput.trim() || nameInput === project.name) { setEditingName(false); return; }
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() }),
    });
    onUpdate({ name: nameInput.trim() });
    setEditingName(false);
  };

  const handleDeleteEntry = async (entryId: number) => {
    await fetch(`/api/projects/${project.id}/entries/${entryId}`, { method: "DELETE" });
    fetchData();
  };

  // Compute totals
  const totals = metrics.map(m => ({
    ...m,
    total: entries.reduce((sum, e) => {
      const mv = e.metrics.find(em => em.metricId === m.id);
      return sum + (mv?.value ?? 0);
    }, 0),
    latest: (() => {
      const mv = entries[0]?.metrics.find(em => em.metricId === m.id);
      return mv?.value ?? null;
    })(),
  }));

  // Chart data
  const chartData = [...entries].reverse().map(e => {
    const point: Record<string, unknown> = { date: e.date };
    e.metrics.forEach(m => { point[m.name] = m.value; });
    return point;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: project.color + "22", border: `1px solid ${project.color}44` }}
          >
            {project.icon}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="text-2xl font-bold bg-white/5 border border-white/20 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-indigo-500 w-64"
                />
                <button onClick={handleSaveName} className="text-green-400 hover:text-green-300 text-sm">Save</button>
                <button onClick={() => setEditingName(false)} className="text-slate-500 hover:text-slate-300 text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <button onClick={() => setEditingName(true)} className="text-slate-600 hover:text-slate-400 text-sm">✏️</button>
              </div>
            )}
            <p className="text-slate-500 text-sm mt-0.5">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} logged
              {entries.length > 0 && ` · Last: ${entries[0].date}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <span className="text-orange-400 text-sm">🔥</span>
              <span className="text-orange-400 text-sm font-semibold">{streak} day streak</span>
            </div>
          )}
          <button
            onClick={() => setShowForm(f => !f)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: showForm ? "#374151" : project.color }}
          >
            {showForm ? "Cancel" : "+ Log Today"}
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Delete project?</span>
              <button onClick={onDelete} className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-white/5 transition-colors text-sm">🗑️</button>
          )}
        </div>
      </div>

      {/* Entry Form */}
      {showForm && (
        <EntryForm
          projectId={project.id}
          metrics={metrics}
          color={project.color}
          onSubmit={() => { fetchData(); setShowForm(false); onRefresh(); }}
        />
      )}

      {/* Totals */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {totals.map(m => (
            <div
              key={m.id}
              className="rounded-2xl p-4 border"
              style={{ background: m.color + "11", borderColor: m.color + "33" }}
            >
              <p className="text-xs text-slate-500 mb-1">{m.name} (all time)</p>
              <p className="text-xl font-bold text-white">{formatValue(m.total, m.type, m.unit)}</p>
              {m.latest !== null && (
                <p className="text-xs mt-1" style={{ color: m.color }}>
                  Latest: {formatValue(m.latest, m.type, m.unit)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <TrackerChart data={chartData} metrics={metrics} />
      )}

      {/* Entries table */}
      {entries.length > 0 ? (
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Entries</h2>
            <span className="text-xs text-slate-500">{entries.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs text-slate-500 font-medium">Date</th>
                  {metrics.map(m => (
                    <th key={m.id} className="text-right px-4 py-3 text-xs font-medium" style={{ color: m.color }}>
                      {m.name}
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 text-xs text-slate-500 font-medium">Note</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 20).map(e => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                    <td className="px-6 py-3 text-slate-300 font-medium">{e.date}</td>
                    {metrics.map(m => {
                      const mv = e.metrics.find(em => em.metricId === m.id);
                      return (
                        <td key={m.id} className="px-4 py-3 text-right font-medium" style={{ color: m.color }}>
                          {mv ? formatValue(mv.value, m.type, m.unit) : "—"}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{e.note || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteEntry(e.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all text-xs"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 p-12 flex flex-col items-center gap-4 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="text-4xl">{project.icon}</div>
          <div>
            <p className="text-white font-medium">No entries yet</p>
            <p className="text-slate-500 text-sm mt-1">Click &quot;Log Today&quot; to add your first entry</p>
          </div>
        </div>
      )}
    </div>
  );
}
