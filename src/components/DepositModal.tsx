"use client";

import React, { useState, useEffect } from "react";
import { X, PiggyBank, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { User as UserType, Goal, Contribution } from "@/types";
import { getLocalData, saveLocalData, recalculateDashboard, findCanonicalUser } from "@/lib/storage";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  goals: Goal[];
  initialUserId?: string;
  initialGoalId?: string;
  onSuccess: (newContrib?: any) => void;
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
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [goalId, setGoalId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialUserId) {
        setSelectedUserId(initialUserId);
      } else if (users.length > 0) {
        setSelectedUserId(users[0].id);
      }
      if (initialGoalId) {
        setGoalId(initialGoalId);
      } else {
        setGoalId("");
      }
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, initialUserId, initialGoalId, users]);

  if (!isOpen) return null;

  const activeUserId = selectedUserId || users[0]?.id || "";
  const selectedUser = findCanonicalUser(users, activeUserId) || users[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Informe um valor de aporte válido.");
      return;
    }

    setLoading(true);
    const selectedGoal = goals.find((g) => g.id === goalId) || null;

    const newContrib: Contribution = {
      id: "contrib-" + Date.now(),
      apartmentId: "default-ape",
      userId: selectedUser.id,
      user: selectedUser,
      goalId: goalId || null,
      goal: selectedGoal,
      amount: parsedAmount,
      date: date ? `${date}T12:00:00.000Z` : new Date().toISOString(),
      notes: notes.trim() || null,
    };

    // 1. Atualiza e salva no storage local com recálculo imediato
    const local = getLocalData();
    local.recentContributions = [newContrib, ...(local.recentContributions || [])];
    const recalculated = recalculateDashboard(local);
    saveLocalData(recalculated);

    // 2. Efeito de celebração
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    onSuccess(newContrib);
    onClose();
    setAmount("");
    setNotes("");
    setLoading(false);

    // 3. Sincroniza em background com o backend se disponível
    try {
      await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          userName: selectedUser.name,
          goalId: goalId || null,
          amount: parsedAmount,
          date: date || new Date().toISOString().split("T")[0],
          notes: notes.trim() || null,
        }),
      });
    } catch (err) {
      console.warn("Background API sync failed, persisted locally:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

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

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quem está aportando?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {users.map((u) => {
                const isSelected = selectedUser.id === u.id || selectedUser.name.toLowerCase() === u.name.toLowerCase();
                const isCarol = u.name.toLowerCase().includes("carol");
                
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? isCarol
                          ? "border-pink-500 bg-pink-50 text-pink-950 shadow-sm ring-2 ring-pink-500/20"
                          : "border-blue-500 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full text-xs text-white font-bold flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: u.avatarColor || (isCarol ? "#ec4899" : "#3b82f6") }}
                    >
                      {u.name[0]}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {isSelected ? "Selecionado" : "Clique p/ escolher"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Valor do Aporte (R$)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-black text-base">
                R$
              </div>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2.500,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Data do Aporte</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Observação / Detalhe
              </label>
              <input
                type="text"
                placeholder="Ex: Salário, economia..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="pt-2 pb-2 sm:pb-0">
            <button
              type="submit"
              disabled={loading || !amount}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Salvando..." : `Confirmar Aporte de ${selectedUser.name}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}