"use client";

import React, { useState } from "react";
import { Plus, PiggyBank, KeyRound, Hammer, PaintBucket, Tv, FileText, CheckCircle, Calendar, Trash2, Edit2 } from "lucide-react";
import { Goal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface GoalsSectionProps {
  goals: Goal[];
  onOpenGoalModal: () => void;
  onOpenDepositModal: (userId?: string, goalId?: string) => void;
  onDeleteGoal?: (id: string) => void;
  onEditGoalTarget?: (id: string, currentTarget: number, currentTitle: string) => void;
}

const iconMap: Record<string, any> = {
  PiggyBank,
  KeyRound,
  Hammer,
  PaintBucket,
  Tv,
  FileText,
};

export function GoalsSection({
  goals,
  onOpenGoalModal,
  onOpenDepositModal,
  onDeleteGoal,
  onEditGoalTarget,
}: GoalsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");

  const categories = ["TODAS", "ENTRADA", "REFORMA", "MARCENARIA", "ELETROS", "DOCUMENTACAO", "OUTRO"];

  const filteredGoals =
    selectedCategory === "TODAS"
      ? goals
      : goals.filter((g) => g.category.toUpperCase() === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Filters & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat === "TODAS"
                ? "Todas as Metas"
                : cat === "ENTRADA"
                ? "Entrada"
                : cat === "REFORMA"
                ? "Reforma"
                : cat === "MARCENARIA"
                ? "Marcenaria"
                : cat === "ELETROS"
                ? "Eletros"
                : cat === "DOCUMENTACAO"
                ? "Documentos / ITBI"
                : "Outros"}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenGoalModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Caixinha</span>
        </button>
      </div>

      {/* Grid of Goals */}
      {filteredGoals.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-600">Nenhuma caixinha nesta categoria.</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Criar Nova Caixinha" para adicionar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const IconComponent = iconMap[goal.icon] || PiggyBank;
            const hasTarget = goal.targetAmount > 0;
            const percent = hasTarget
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;
            const isDone = hasTarget && goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                {/* Category Color Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: goal.color || "#10b981" }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: goal.color || "#10b981" }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                          {goal.title}
                        </h4>
                        <span className="text-[11px] font-medium text-slate-400">
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" />
                          100%
                        </span>
                      )}
                      {onDeleteGoal && (
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Excluir caixinha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {goal.description && (
                    <p className="mt-3 text-xs text-slate-500 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar & Amount */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Acumulado:</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color || "#10b981",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <span>Meta: {hasTarget ? formatCurrency(goal.targetAmount) : "A definir"}</span>
                        {onEditGoalTarget && (
                          <button
                            onClick={() => onEditGoalTarget(goal.id, goal.targetAmount, goal.title)}
                            className="text-slate-400 hover:text-emerald-600 p-0.5 rounded"
                            title="Ajustar valor alvo"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {hasTarget && <span className="font-bold text-slate-700">{percent}%</span>}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {goal.deadline ? (
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Até {formatDate(goal.deadline)}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Sem prazo fixo</span>
                  )}

                  <button
                    onClick={() => onOpenDepositModal(undefined, goal.id)}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Aportar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}