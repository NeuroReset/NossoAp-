"use client";

import React from "react";
import { Plus, Check, Scale, Trash2 } from "lucide-react";
import { Expense, User } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ExpensesSectionProps {
  expenses: Expense[];
  users: User[];
  balances: {
    userA: User;
    userB: User;
    userAPaid: number;
    userBPaid: number;
    debtorName: string | null;
    creditorName: string | null;
    settlementAmount: number;
    isBalanced: boolean;
  };
  onOpenExpenseModal: () => void;
  onTogglePaid: (id: string, currentStatus: boolean) => void;
  onDeleteExpense?: (id: string) => void;
}

export function ExpensesSection({
  expenses,
  users,
  balances,
  onOpenExpenseModal,
  onTogglePaid,
  onDeleteExpense,
}: ExpensesSectionProps) {
  return (
    <div className="space-y-6">
      {/* Balance Reconciliation Card (Quem deve pra quem) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Balanço & Acerto de Contas do Mês</h3>
            <p className="text-xs text-slate-500">Cálculo automático de divisão 50/50 das contas pagas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* User A Paid */}
          {balances.userA && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div
                  className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center"
                  style={{ backgroundColor: balances.userA.avatarColor }}
                >
                  {balances.userA.name[0]}
                </div>
                {balances.userA.name} pagou no total:
              </div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {formatCurrency(balances.userAPaid)}
              </div>
            </div>
          )}

          {/* User B Paid */}
          {balances.userB && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div
                  className="w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center"
                  style={{ backgroundColor: balances.userB.avatarColor }}
                >
                  {balances.userB.name[0]}
                </div>
                {balances.userB.name} pagou no total:
              </div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {formatCurrency(balances.userBPaid)}
              </div>
            </div>
          )}

          {/* Result / Acerto */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col justify-center">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Resultado da Divisão
            </span>
            {balances.isBalanced ? (
              <div className="text-sm font-bold text-emerald-900 mt-1">
                🎉 Contas 100% equilibradas! Ninguém deve nada.
              </div>
            ) : (
              <div className="text-sm font-black text-emerald-950 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-emerald-700">{balances.debtorName}</span>
                <span className="text-slate-600 font-normal">deve pagar</span>
                <span className="text-emerald-800 font-extrabold">
                  {formatCurrency(balances.settlementAmount)}
                </span>
                <span className="text-slate-600 font-normal">para</span>
                <span className="text-emerald-700">{balances.creditorName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Boletos e Contas Compartilhadas</h3>
            <p className="text-xs text-slate-500">
              Taxa de obra, condomínio, IPTU provisório e parcelas
            </p>
          </div>
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Conta
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Status</th>
                <th className="pb-3">Descrição da Conta</th>
                <th className="pb-3">Vencimento</th>
                <th className="pb-3">Quem Paga</th>
                <th className="pb-3 text-right">Valor</th>
                <th className="pb-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Nenhuma despesa cadastrada para este mês.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-2">
                      <button
                        onClick={() => onTogglePaid(exp.id, exp.isPaid)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                          exp.isPaid
                            ? "bg-emerald-500 text-white"
                            : "border-2 border-slate-300 text-transparent hover:border-emerald-500"
                        }`}
                        title={exp.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="py-3 font-semibold text-slate-900 text-xs sm:text-sm">
                      {exp.title}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-600">{formatDate(exp.dueDate)}</td>
                    <td className="py-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full text-[8px] text-white font-bold flex items-center justify-center"
                          style={{ backgroundColor: exp.paidBy?.avatarColor || "#3b82f6" }}
                        >
                          {exp.paidBy?.name[0]}
                        </div>
                        <span className="text-slate-700 font-medium">{exp.paidBy?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 text-xs sm:text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            exp.isPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {exp.isPaid ? "Pago" : "Pendente"}
                        </span>
                        {onDeleteExpense && (
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Excluir conta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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