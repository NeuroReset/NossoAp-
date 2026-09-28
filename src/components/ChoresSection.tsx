"use client";

import React, { useState } from "react";
import { Square, Plus, CheckCircle2, Trash2 } from "lucide-react";
import { Chore, User } from "@/types";

interface ChoresSectionProps {
  chores: Chore[];
  users: User[];
  onToggleChore: (id: string, currentDone: boolean) => void;
  onAddChore: (title: string, assignedToId?: string, frequency?: string) => void;
  onDeleteChore?: (id: string) => void;
}

export function ChoresSection({
  chores,
  users,
  onToggleChore,
  onAddChore,
  onDeleteChore,
}: ChoresSectionProps) {
  const [newTitle, setNewTitle] = useState("");
  const [assignedId, setAssignedId] = useState(users[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddChore(newTitle, assignedId || undefined);
    setNewTitle("");
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Checklist do Apê & Pendências</h3>
          <p className="text-xs text-slate-500">Vistorias, cotações, orçamentos e rotina</p>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {chores.filter((c) => c.isDone).length}/{chores.length} concluídas
        </span>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Adicionar nova pendência ou tarefa..."
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
        <select
          value={assignedId}
          onChange={(e) => setAssignedId(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* List */}
      <div className="space-y-2 pt-2">
        {chores.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Nenhuma pendência cadastrada.</p>
        ) : (
          chores.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                c.isDone
                  ? "bg-slate-50/60 border-slate-100 opacity-60"
                  : "bg-white border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div
                onClick={() => onToggleChore(c.id, c.isDone)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <button className="text-slate-400" type="button">
                  {c.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                  )}
                </button>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    c.isDone ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {c.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {c.assignedTo && (
                  <div
                    className="w-6 h-6 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                    style={{ backgroundColor: c.assignedTo.avatarColor || "#3b82f6" }}
                    title={c.assignedTo.name}
                  >
                    {c.assignedTo.name[0]}
                  </div>
                )}
                {onDeleteChore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChore(c.id);
                    }}
                    className="p-1 text-slate-300 hover:text-red-600 rounded transition-colors"
                    title="Excluir pendência"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}