"use client";

import React, { useState, useEffect } from "react";
import { X, Target, Sparkles, Calendar, DollarSign, Tag, FileText, Palette } from "lucide-react";
import { Goal } from "@/types";
import { getLocalData, saveLocalData, recalculateDashboard } from "@/lib/storage";
import { parseBRL } from "@/lib/utils";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
  onSuccess: () => void;
}

export function GoalModal({ isOpen, onClose, goalToEdit, onSuccess }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("REFORMA");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState("#10b981");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title || "");
        setDescription(goalToEdit.description || "");
        setCategory(goalToEdit.category || "REFORMA");
        setTargetAmount(
          goalToEdit.targetAmount > 0
            ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(goalToEdit.targetAmount)
            : ""
        );
        setDeadline(
          goalToEdit.deadline
            ? new Date(goalToEdit.deadline).toISOString().split("T")[0]
            : ""
        );
        setColor(goalToEdit.color || "#10b981");
      } else {
        setTitle("");
        setDescription("");
        setCategory("REFORMA");
        setTargetAmount("");
        setDeadline("");
        setColor("#10b981");
      }
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const isEditing = Boolean(goalToEdit);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "ENTRADA":
        return "KeyRound";
      case "REFORMA":
        return "Hammer";
      case "MARCENARIA":
        return "PaintBucket";
      case "ELETROS":
        return "Tv";
      case "DOCUMENTACAO":
        return "FileText";
      default:
        return "PiggyBank";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const parsedTarget = parseBRL(targetAmount);
    const icon = getCategoryIcon(category);
    const formattedDeadline = deadline ? `${deadline}T12:00:00.000Z` : null;

    const local = getLocalData();

    if (isEditing && goalToEdit) {
      // 1. Atualizar meta existente
      const updatedGoals = (local.goals || []).map((g) => {
        if (g.id === goalToEdit.id) {
          return {
            ...g,
            title: title.trim(),
            description: description.trim() || null,
            category,
            targetAmount: parsedTarget,
            deadline: formattedDeadline,
            color,
            icon,
          };
        }
        return g;
      });

      local.goals = updatedGoals;
      const recalculated = recalculateDashboard(local);
      saveLocalData(recalculated);

      onSuccess();
      onClose();
      setLoading(false);

      try {
        await fetch("/api/goals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: goalToEdit.id,
            title: title.trim(),
            description: description.trim() || null,
            category,
            targetAmount: parsedTarget,
            deadline: formattedDeadline,
            color,
            icon,
          }),
        });
      } catch (err) {}
    } else {
      // 2. Criar nova meta
      const newGoal: Goal = {
        id: "goal-" + Date.now(),
        apartmentId: "default-ape",
        title: title.trim(),
        description: description.trim() || null,
        category,
        targetAmount: parsedTarget,
        currentAmount: 0,
        color,
        icon,
        deadline: formattedDeadline,
        isCompleted: false,
      };

      local.goals = [...(local.goals || []), newGoal];
      const recalculated = recalculateDashboard(local);
      saveLocalData(recalculated);

      onSuccess();
      onClose();
      setLoading(false);

      try {
        await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            category,
            targetAmount: parsedTarget,
            deadline: formattedDeadline,
            color,
            icon,
          }),
        });
      } catch (err) {}
    }
  };

  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444", "#64748b"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? "Editar Caixinha / Meta" : "Nova Caixinha / Meta"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? "Altere o título, valor alvo, prazo e detalhes" : "Defina objetivos financeiros para o apê"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Título da Caixinha
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Marcenaria Cozinha, Reforma Geral, Sofá..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Valor Alvo (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="25.000,00 ou 5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Prazo / Data Limite (Opcional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline("")}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
                  title="Remover prazo"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Descrição / Detalhes (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pisos, iluminação, orçamento fechado com arquiteto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm" : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Salvando..." : isEditing ? "Salvar Alterações da Meta" : "Criar Nova Caixinha"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}