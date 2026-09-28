"use client";

import React, { useState } from "react";
import { X, Target } from "lucide-react";
import { Goal } from "@/types";
import { getLocalData, saveLocalData, recalculateDashboard } from "@/lib/storage";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GoalModal({ isOpen, onClose, onSuccess }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("REFORMA");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#10b981");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setLoading(true);
    const parsedTarget = parseFloat(targetAmount || "0");

    const newGoal: Goal = {
      id: "goal-" + Date.now(),
      apartmentId: "default-ape",
      title,
      description: description || null,
      category,
      targetAmount: parsedTarget,
      currentAmount: 0,
      color,
      icon:
        category === "ENTRADA"
          ? "KeyRound"
          : category === "REFORMA"
          ? "Hammer"
          : category === "MARCENARIA"
          ? "PaintBucket"
          : category === "ELETROS"
          ? "Tv"
          : category === "DOCUMENTACAO"
          ? "FileText"
          : "PiggyBank",
      deadline: deadline || null,
      isCompleted: false,
    };

    const local = getLocalData();
    local.goals = [...(local.goals || []), newGoal];
    const recalculated = recalculateDashboard(local);
    saveLocalData(recalculated);

    onSuccess();
    onClose();
    setTitle("");
    setTargetAmount("");
    setDescription("");
    setLoading(false);

    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          targetAmount: parsedTarget,
          deadline: deadline || null,
          color,
          icon: newGoal.icon,
        }),
      });
    } catch (err) {}
  };

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Nova Caixinha / Meta</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Título da Meta</label>
            <input
              type="text"
              required
              placeholder="Ex: Marcenaria Cozinha, Sofá dos Sonhos..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="ENTRADA">Entrada do Imóvel</option>
                <option value="REFORMA">Reforma & Obra</option>
                <option value="MARCENARIA">Marcenaria Planejada</option>
                <option value="ELETROS">Eletrodomésticos</option>
                <option value="DOCUMENTACAO">Documentação & ITBI</option>
                <option value="RESERVA">Reserva de Emergência</option>
                <option value="OUTRO">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Alvo (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="25.000,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Data Limite (Prazo)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cor de Destaque</label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-slate-800 scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            {loading ? "Criando..." : "Salvar Caixinha"}
          </button>
        </form>
      </div>
    </div>
  );
}