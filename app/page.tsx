"use client";

import { useEffect, useState, useCallback } from "react";
import ProjectDashboard from "./components/ProjectDashboard";
import CreateProjectModal from "./components/CreateProjectModal";

interface Project {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  entry_count: number;
  last_entry: string | null;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    }
    setLoading(false);
  }, [selectedProject]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      setSelectedProject(data[0]);
    }
    setShowCreate(false);
  };

  const handleDeleteProject = async (id: number) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    setSelectedProject(remaining[0] || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading your trackers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col" style={{ background: "rgba(255,255,255,0.02)" }}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
              📈
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Daily Tracker</h1>
              <p className="text-xs text-slate-500">Track anything</p>
            </div>
          </div>
        </div>

        {/* Projects list */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 mb-2">Projects</p>
          {projects.length === 0 ? (
            <p className="text-xs text-slate-600 px-3 py-2">No projects yet</p>
          ) : (
            <ul className="space-y-1">
              {projects.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => setSelectedProject(p)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      selectedProject?.id === p.id
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="text-lg leading-none">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.entry_count} {p.entry_count === 1 ? "entry" : "entries"}
                      </p>
                    </div>
                    {selectedProject?.id === p.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* New Project button */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            New Project
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {selectedProject ? (
          <ProjectDashboard
            project={selectedProject}
            onRefresh={fetchProjects}
            onDelete={() => handleDeleteProject(selectedProject.id)}
            onUpdate={(updated) => {
              setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
              setSelectedProject(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
            }}
          />
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-6xl">📊</div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">No projects yet</h2>
              <p className="text-slate-400">Create your first project to start tracking anything.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Create a Project
            </button>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
