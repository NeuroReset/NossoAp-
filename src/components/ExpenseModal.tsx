"use client";

import React, { useState } from "react";
import { X, Receipt } from "lucide-react";
import { User, Expense } from "@/types";
import { getLocalData, saveLocalData, recalculateDashboard } from "@/lib/storage";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSuccess: () => void;
}

export function ExpenseModal({ isOpen, onClose, users, onSuccess }: ExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CONDOMINIO");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidById, setPaidById] = useState(users[0]?.id || "");
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !paidById) return;

    setLoading(true);
    const parsedAmount = parseFloat(amount.replace(",", "."));
    const paidBy = users.find((u) => u.id === paidById) || users[0];

    const newExpense: Expense = {
      id: "exp-" + Date.now(),
      apartmentId: "default-ape",
      paidById,
      paidBy,
      title,
      category,
      amount: parsedAmount,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      splitType: "EQUAL_50_50",
      isPaid,
      paidDate: isPaid ? new Date().toISOString() : null,
    };

    const local = getLocalData();
    local.expenses = [newExpense, ...(local.expenses || [])];
    const recalculated = recalculateDashboard(local);
    saveLocalData(recalculated);

    onSuccess();
    onClose();
    setTitle("");
    setAmount("");
    setLoading(false);

    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          amount: parsedAmount,
          dueDate,
          paidById,
          splitType: "EQUAL_50_50",
          isPaid,
        }),
      });
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        <div className="bg-amber-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-200" />
            <h3 className="font-bold text-base">Nova Conta Compartilhada</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-200 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição da Conta</label>
            <input
              type="text"
              required
              placeholder="Ex: Taxa de Obra, Condomínio, IPTU..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
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
                <option value="PARCELA_IMOVEL">Taxa / Parcela Imóvel</option>
                <option value="CONDOMINIO">Condomínio</option>
                <option value="LUZ">Energia Elétrica</option>
                <option value="AGUA">Água / Esgoto</option>
                <option value="GAS">Gás</option>
                <option value="INTERNET">Internet</option>
                <option value="MERCADO">Mercado / Feira</option>
                <option value="REFORMA">Obra / Serviços</option>
                <option value="OUTRO">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="450,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quem Pagou / Paga</label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="isPaid" className="text-xs font-medium text-slate-700 cursor-pointer">
              Esta conta já foi paga
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            {loading ? "Salvando..." : "Salvar Despesa"}
          </button>
        </form>
      </div>
    </div>
  );
}