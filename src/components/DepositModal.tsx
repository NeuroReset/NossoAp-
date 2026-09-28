"use client";

import React, { useState, useEffect } from "react";
import { X, PiggyBank, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { User as UserType, Goal } from "@/types";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  goals: Goal[];
  initialUserId?: string;
  initialGoalId?: string;
  onSuccess: () => void;
}

export function DepositModal({
  isOpen,
  onClose,
  users,
  goals,
  initialUserId,
  initialGoalId,
  onSuccess,
}: DepositModalProps) {
  const [userId, setUserId] = useState(initialUserId || users[0]?.id || "");
  const [goalId, setGoalId] = useState(initialGoalId || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialUserId) setUserId(initialUserId);
    if (initialGoalId) setGoalId(initialGoalId);
    else if (users.length > 0 && !userId) setUserId(users[0].id);
  }, [initialUserId, initialGoalId, users, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          goalId: goalId || null,
          amount: parseFloat(amount.replace(",", ".")),
          date,
          notes,
        }),
      });

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        onSuccess();
        onClose();
        setAmount("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Drag Handle indicator for mobile */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        {/* Modal Header */}
        <div className="bg-emerald-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Registrar Novo Aporte</h3>
              <p className="text-xs text-emerald-100">Dinheiro guardado para o apê</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* User Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quem está aportando?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => setUserId(u.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    userId === u.id
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full text-[10px] text-white font-bold flex items-center justify-center"
                    style={{ backgroundColor: u.avatarColor }}
                  >
                    {u.name[0]}
                  </div>
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Valor do Aporte (R$)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                R$
              </div>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2.500,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Caixinha / Meta de Destino (Opcional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Cofre Geral (Sem caixinha específica)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observação / Detalhe
              </label>
              <input
                type="text"
                placeholder="Ex: Bônus, economia do mês..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 pb-2 sm:pb-0">
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Salvando..." : "Confirmar Aporte"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}