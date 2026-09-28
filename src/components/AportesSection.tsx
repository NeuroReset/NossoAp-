"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Plus, Trash2, Edit2 } from "lucide-react";
import { PartnerMonthlyStatus, Contribution, Goal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AportesSectionProps {
  partners: PartnerMonthlyStatus[];
  recentContributions: Contribution[];
  goals: Goal[];
  onOpenDepositModal: (userId?: string) => void;
  onDeleteContribution: (id: string) => void;
  onUpdateUserTarget?: (userId: string, currentTarget: number) => void;
}

export function AportesSection({
  partners,
  recentContributions,
  goals,
  onOpenDepositModal,
  onDeleteContribution,
  onUpdateUserTarget,
}: AportesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Casal Monthly Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {partners.map((partner) => {
          const isDone = partner.target > 0 && partner.currentMonthTotal >= partner.target;
          return (
            <div
              key={partner.user.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md"
                    style={{ backgroundColor: partner.user.avatarColor || "#3b82f6" }}
                  >
                    {partner.user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{partner.user.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Meta Mensal:</span>
                      <span className="font-semibold text-slate-700">
                        {partner.target > 0 ? formatCurrency(partner.target) : "A definir"}
                      </span>
                      {onUpdateUserTarget && (
                        <button
                          onClick={() => onUpdateUserTarget(partner.user.id, partner.target)}
                          className="text-slate-400 hover:text-emerald-600 p-0.5 rounded transition-colors"
                          title="Definir meta mensal"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {partner.target > 0 ? (
                  isDone ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Meta Atingida!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Falta: {formatCurrency(Math.max(0, partner.target - partner.currentMonthTotal))}
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => onUpdateUserTarget && onUpdateUserTarget(partner.user.id, partner.target)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    + Definir Meta
                  </button>
                )}
              </div>

              {/* Progress & Values */}
              <div className="mt-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Aportado neste mês:</span>
                  <span className="text-xl font-black text-slate-900">
                    {formatCurrency(partner.currentMonthTotal)}
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isDone ? "bg-emerald-500" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(100, partner.progressPercent || 0)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Progresso do mês</span>
                  <span className="font-bold text-slate-700">{partner.progressPercent || 0}%</span>
                </div>
              </div>

              {/* Footer / Stats */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Total acumulado:{" "}
                  <span className="font-bold text-slate-800">
                    {formatCurrency(partner.historicalTotal)}
                  </span>{" "}
                  {partner.historicalTotal > 0 && `(${partner.historicalPercent}% do cofre)`}
                </div>

                <button
                  onClick={() => onOpenDepositModal(partner.user.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Aporte Rápido
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extrato Recente de Aportes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Histórico de Aportes</h3>
            <p className="text-xs text-slate-500">Entradas registradas para as caixinhas e reserva do apê</p>
          </div>
          <button
            onClick={() => onOpenDepositModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Registro
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Morador</th>
                <th className="pb-3">Data</th>
                <th className="pb-3">Destino (Caixinha)</th>
                <th className="pb-3">Nota / Detalhe</th>
                <th className="pb-3 text-right">Valor</th>
                <th className="pb-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentContributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    Nenhum aporte registrado ainda. Clique em "Novo Registro" para adicionar o primeiro valor!
                  </td>
                </tr>
              ) : (
                recentContributions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: c.user?.avatarColor || "#3b82f6" }}
                        >
                          {c.user?.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {c.user?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-slate-600">{formatDate(c.date)}</td>
                    <td className="py-3 text-xs">
                      {c.goal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-slate-700 bg-slate-100">
                          {c.goal.title}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Cofre Geral</span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-slate-500 max-w-[200px] truncate">
                      {c.notes || "—"}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-600 text-xs sm:text-sm">
                      +{formatCurrency(c.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => onDeleteContribution(c.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Excluir aporte"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}