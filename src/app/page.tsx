"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  PiggyBank,
  Target,
  ShoppingBag,
  Receipt,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import { DashboardData, Contribution, Goal, Expense, WishlistItem, Chore } from "@/types";
import { Header } from "@/components/Header";
import { MetricCards } from "@/components/MetricCards";
import { AportesSection } from "@/components/AportesSection";
import { GoalsSection } from "@/components/GoalsSection";
import { HistoryCharts } from "@/components/HistoryCharts";
import { WishlistSection } from "@/components/WishlistSection";
import { ExpensesSection } from "@/components/ExpensesSection";
import { ChoresSection } from "@/components/ChoresSection";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LockScreen } from "@/components/LockScreen";
import { DepositModal } from "@/components/DepositModal";
import { GoalModal } from "@/components/GoalModal";
import { WishlistModal } from "@/components/WishlistModal";
import { ExpenseModal } from "@/components/ExpenseModal";
import { getLocalData, saveLocalData, recalculateDashboard, mergeServerAndLocal } from "@/lib/storage";
import { parseBRL } from "@/lib/utils";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"geral" | "aportes" | "metas" | "enxoval" | "contas" | "tarefas">("geral");

  // Modals state
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedUserIdForDeposit, setSelectedUserIdForDeposit] = useState<string | undefined>();
  const [selectedGoalIdForDeposit, setSelectedGoalIdForDeposit] = useState<string | undefined>();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    const savedAuth = localStorage.getItem("nossoape_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const local = getLocalData();
      
      // Tentativa de buscar no servidor se disponível
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && json.apartment) {
          const merged = mergeServerAndLocal(json, local);
          const recalculated = recalculateDashboard(merged);
          setData(recalculated);
          saveLocalData(recalculated);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("API fallback to local data:", err);
    }

    // Carregamento local garantido
    const local = getLocalData();
    const recalculated = recalculateDashboard(local);
    setData(recalculated);
    saveLocalData(recalculated);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const updateAndPersist = (updated: DashboardData) => {
    const recalculated = recalculateDashboard(updated);
    setData(recalculated);
    saveLocalData(recalculated);
  };

  const handleLockApp = () => {
    localStorage.removeItem("nossoape_auth");
    setIsAuthenticated(false);
  };

  const handleOpenDepositModal = (userId?: string, goalId?: string) => {
    setSelectedUserIdForDeposit(userId);
    setSelectedGoalIdForDeposit(goalId);
    setDepositModalOpen(true);
  };

  const handleOpenCreateGoalModal = () => {
    setGoalToEdit(null);
    setGoalModalOpen(true);
  };

  const handleOpenEditGoalModal = (goal: Goal) => {
    setGoalToEdit(goal);
    setGoalModalOpen(true);
  };

  const handleDepositSuccess = (newContrib?: any) => {
    const local = getLocalData();
    const recalculated = recalculateDashboard(local);
    setData(recalculated);
    saveLocalData(recalculated);
  };

  const handleUpdateUserTarget = async (userId: string, currentTarget: number) => {
    const currentData = data || getLocalData();
    const targetUser = currentData.users.find((u) => u.id === userId || u.name.toLowerCase().includes(userId.toLowerCase()));
    const userName = targetUser ? targetUser.name : "morador";

    const newVal = prompt(`Definir meta mensal de aporte para ${userName} (R$):`, currentTarget > 0 ? String(currentTarget) : "");
    if (newVal === null) return;
    const parsed = parseBRL(newVal);
    if (parsed < 0) {
      alert("Valor inválido.");
      return;
    }

    const updatedUsers = currentData.users.map((u) => {
      if (u.id === userId || u.name.toLowerCase() === userName.toLowerCase()) {
        return { ...u, monthlyTarget: parsed };
      }
      return u;
    });

    updateAndPersist({ ...currentData, users: updatedUsers });

    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name: userName, monthlyTarget: parsed }),
      });
    } catch (e) {}
  };

  const handleDeleteContribution = async (id: string) => {
    if (!confirm("Deseja realmente remover este aporte?")) return;
    const currentData = data || getLocalData();
    const filtered = (currentData.recentContributions || []).filter((c) => c.id !== id);
    updateAndPersist({ ...currentData, recentContributions: filtered });

    try {
      await fetch(`/api/contributions?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta caixinha/meta?")) return;
    const currentData = data || getLocalData();
    const filtered = (currentData.goals || []).filter((g) => g.id !== id);
    updateAndPersist({ ...currentData, goals: filtered });

    try {
      await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;
    const currentData = data || getLocalData();
    const filtered = (currentData.expenses || []).filter((e) => e.id !== id);
    updateAndPersist({ ...currentData, expenses: filtered });

    try {
      await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const handleToggleExpensePaid = async (id: string, currentStatus: boolean) => {
    const currentData = data || getLocalData();
    const updatedExpenses = currentData.expenses.map((e) => (e.id === id ? { ...e, isPaid: !currentStatus } : e));
    updateAndPersist({ ...currentData, expenses: updatedExpenses });

    try {
      await fetch("/api/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: !currentStatus }),
      });
    } catch (e) {}
  };

  const handleUpdateWishlistStatus = async (
    id: string,
    status: string,
    actualPrice?: number,
    boughtById?: string
  ) => {
    const currentData = data || getLocalData();
    const updatedList = currentData.wishlist.map((item) =>
      item.id === id ? { ...item, status: status as any, actualPrice: actualPrice ?? item.actualPrice, boughtById } : item
    );
    updateAndPersist({ ...currentData, wishlist: updatedList });

    try {
      await fetch("/api/wishlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, actualPrice, boughtById }),
      });
    } catch (e) {}
  };

  const handleDeleteWishlistItem = async (id: string) => {
    if (!confirm("Remover este item da lista de compras?")) return;
    const currentData = data || getLocalData();
    const filtered = currentData.wishlist.filter((i) => i.id !== id);
    updateAndPersist({ ...currentData, wishlist: filtered });

    try {
      await fetch(`/api/wishlist?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const handleToggleChore = async (id: string, currentDone: boolean) => {
    const currentData = data || getLocalData();
    const updatedChores = currentData.chores.map((c) => (c.id === id ? { ...c, isDone: !currentDone } : c));
    updateAndPersist({ ...currentData, chores: updatedChores });

    try {
      await fetch("/api/chores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDone: !currentDone }),
      });
    } catch (e) {}
  };

  const handleAddChore = async (title: string, assignedToId?: string) => {
    const currentData = data || getLocalData();
    const newChore: Chore = {
      id: "chore-" + Date.now(),
      apartmentId: currentData.apartment.id || "default-ape",
      title,
      assignedToId: assignedToId || null,
      assignedTo: currentData.users.find((u) => u.id === assignedToId) || null,
      frequency: "SEMANAL",
      isDone: false,
    };
    updateAndPersist({ ...currentData, chores: [newChore, ...(currentData.chores || [])] });

    try {
      await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, assignedToId }),
      });
    } catch (e) {}
  };

  const handleDeleteChore = async (id: string) => {
    if (!confirm("Deseja realmente remover esta tarefa?")) return;
    const currentData = data || getLocalData();
    const filtered = currentData.chores.filter((c) => c.id !== id);
    updateAndPersist({ ...currentData, chores: filtered });

    try {
      await fetch(`/api/chores?id=${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  // Auth Gate
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <LockScreen onUnlock={() => setIsAuthenticated(true)} />;
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/20 animate-bounce">
          <Building2 className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-600 animate-pulse">
          Carregando dados do Nosso Apê...
        </p>
      </div>
    );
  }

  const currentData = data || recalculateDashboard(getLocalData());

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] pb-20 sm:pb-0">
      {/* Header */}
      <Header
        apartment={currentData.apartment}
        users={currentData.users}
        onOpenDepositModal={() => handleOpenDepositModal()}
        onOpenGoalModal={handleOpenCreateGoalModal}
        onOpenWishlistModal={() => setWishlistModalOpen(true)}
        onOpenExpenseModal={() => setExpenseModalOpen(true)}
        onLockApp={handleLockApp}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Metric Cards Banner */}
        <MetricCards summary={currentData.summary} />

        {/* Desktop Navigation Tabs */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("geral")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "geral"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Visão Geral & Gráficos</span>
          </button>

          <button
            onClick={() => setActiveTab("aportes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "aportes"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Aportes Mensais</span>
          </button>

          <button
            onClick={() => setActiveTab("metas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "metas"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Metas & Caixinhas ({currentData.goals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("enxoval")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "enxoval"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Enxoval & Móveis ({currentData.wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "contas"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Contas & Divisão</span>
          </button>

          <button
            onClick={() => setActiveTab("tarefas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "tarefas"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tarefas & Pendências</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "geral" && (
          <div className="space-y-6">
            {/* Casal monthly status summary */}
            <AportesSection
              partners={currentData.partners}
              recentContributions={currentData.recentContributions}
              goals={currentData.goals}
              onOpenDepositModal={handleOpenDepositModal}
              onDeleteContribution={handleDeleteContribution}
              onUpdateUserTarget={handleUpdateUserTarget}
            />

            {/* Graphs */}
            <HistoryCharts
              monthlyHistory={currentData.monthlyHistory}
              users={currentData.users}
              totalSaved={currentData.summary.totalSaved}
              partners={currentData.partners}
            />

            {/* Grid with Goals and Chores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GoalsSection
                  goals={currentData.goals.slice(0, 4)}
                  onOpenGoalModal={handleOpenCreateGoalModal}
                  onOpenDepositModal={handleOpenDepositModal}
                  onEditGoal={handleOpenEditGoalModal}
                  onDeleteGoal={handleDeleteGoal}
                />
              </div>
              <div>
                <ChoresSection
                  chores={currentData.chores}
                  users={currentData.users}
                  onToggleChore={handleToggleChore}
                  onAddChore={handleAddChore}
                  onDeleteChore={handleDeleteChore}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "aportes" && (
          <AportesSection
            partners={currentData.partners}
            recentContributions={currentData.recentContributions}
            goals={currentData.goals}
            onOpenDepositModal={handleOpenDepositModal}
            onDeleteContribution={handleDeleteContribution}
            onUpdateUserTarget={handleUpdateUserTarget}
          />
        )}

        {activeTab === "metas" && (
          <GoalsSection
            goals={currentData.goals}
            onOpenGoalModal={handleOpenCreateGoalModal}
            onOpenDepositModal={handleOpenDepositModal}
            onEditGoal={handleOpenEditGoalModal}
            onDeleteGoal={handleDeleteGoal}
          />
        )}

        {activeTab === "enxoval" && (
          <WishlistSection
            wishlist={currentData.wishlist}
            users={currentData.users}
            onOpenWishlistModal={() => setWishlistModalOpen(true)}
            onUpdateStatus={handleUpdateWishlistStatus}
            onDeleteItem={handleDeleteWishlistItem}
          />
        )}

        {activeTab === "contas" && (
          <ExpensesSection
            expenses={currentData.expenses}
            users={currentData.users}
            balances={currentData.balances}
            onOpenExpenseModal={() => setExpenseModalOpen(true)}
            onTogglePaid={handleToggleExpensePaid}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === "tarefas" && (
          <ChoresSection
            chores={currentData.chores}
            users={currentData.users}
            onToggleChore={handleToggleChore}
            onAddChore={handleAddChore}
            onDeleteChore={handleDeleteChore}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 hidden sm:block">
        Nosso Apê 🏠 • Gestão Financeira e Planejamento de Casal (Gabriel & Carol)
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDepositModal={() => handleOpenDepositModal()}
      />

      {/* Modals */}
      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        users={currentData.users}
        goals={currentData.goals}
        initialUserId={selectedUserIdForDeposit}
        initialGoalId={selectedGoalIdForDeposit}
        onSuccess={handleDepositSuccess}
      />

      <GoalModal
        isOpen={goalModalOpen}
        goalToEdit={goalToEdit}
        onClose={() => {
          setGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        onSuccess={fetchData}
      />

      <WishlistModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        onSuccess={fetchData}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        users={currentData.users}
        onSuccess={fetchData}
      />
    </div>
  );
}