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
import { DashboardData } from "@/types";
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
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLockApp = () => {
    localStorage.removeItem("nossoape_auth");
    setIsAuthenticated(false);
  };

  const handleOpenDepositModal = (userId?: string, goalId?: string) => {
    setSelectedUserIdForDeposit(userId);
    setSelectedGoalIdForDeposit(goalId);
    setDepositModalOpen(true);
  };

  const handleUpdateUserTarget = async (userId: string, currentTarget: number) => {
    const newVal = prompt("Digite o novo valor da meta mensal de aporte (R$):", currentTarget > 0 ? String(currentTarget) : "");
    if (newVal === null) return;
    const parsed = parseFloat(newVal.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      alert("Valor inválido.");
      return;
    }

    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, monthlyTarget: parsed }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContribution = async (id: string) => {
    if (!confirm("Deseja realmente remover este aporte?")) return;
    try {
      await fetch(`/api/contributions?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta caixinha/meta?")) return;
    try {
      await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditGoalTarget = async (id: string, currentTarget: number, currentTitle: string) => {
    const newVal = prompt(`Definir novo valor alvo para "${currentTitle}" (R$):`, currentTarget > 0 ? String(currentTarget) : "");
    if (newVal === null) return;
    const parsed = parseFloat(newVal.replace(",", "."));
    if (isNaN(parsed) || parsed < 0) {
      alert("Valor inválido.");
      return;
    }

    try {
      await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, targetAmount: parsed }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;
    try {
      await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleExpensePaid = async (id: string, currentStatus: boolean) => {
    try {
      await fetch("/api/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: !currentStatus }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateWishlistStatus = async (
    id: string,
    status: string,
    actualPrice?: number,
    boughtById?: string
  ) => {
    try {
      await fetch("/api/wishlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, actualPrice, boughtById }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteWishlistItem = async (id: string) => {
    if (!confirm("Remover este item da lista de compras?")) return;
    try {
      await fetch(`/api/wishlist?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleChore = async (id: string, currentDone: boolean) => {
    try {
      await fetch("/api/chores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDone: !currentDone }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddChore = async (title: string, assignedToId?: string) => {
    try {
      await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, assignedToId }),
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChore = async (id: string) => {
    if (!confirm("Deseja realmente remover esta tarefa?")) return;
    try {
      await fetch(`/api/chores?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Auth Gate
  if (isAuthenticated === null) {
    return null; // Flash avoidance
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

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-slate-600 mb-4">Não foi possível carregar as informações do apê.</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] pb-20 sm:pb-0">
      {/* Header */}
      <Header
        apartment={data.apartment}
        users={data.users}
        onOpenDepositModal={() => handleOpenDepositModal()}
        onOpenGoalModal={() => setGoalModalOpen(true)}
        onOpenWishlistModal={() => setWishlistModalOpen(true)}
        onOpenExpenseModal={() => setExpenseModalOpen(true)}
        onLockApp={handleLockApp}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Metric Cards Banner */}
        <MetricCards summary={data.summary} />

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
            <span>Metas & Caixinhas ({data.goals.length})</span>
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
            <span>Enxoval & Móveis ({data.wishlist.length})</span>
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
              partners={data.partners}
              recentContributions={data.recentContributions}
              goals={data.goals}
              onOpenDepositModal={handleOpenDepositModal}
              onDeleteContribution={handleDeleteContribution}
              onUpdateUserTarget={handleUpdateUserTarget}
            />

            {/* Graphs */}
            <HistoryCharts
              monthlyHistory={data.monthlyHistory}
              users={data.users}
              totalSaved={data.summary.totalSaved}
            />

            {/* Grid with Goals and Chores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GoalsSection
                  goals={data.goals.slice(0, 4)}
                  onOpenGoalModal={() => setGoalModalOpen(true)}
                  onOpenDepositModal={handleOpenDepositModal}
                  onDeleteGoal={handleDeleteGoal}
                  onEditGoalTarget={handleEditGoalTarget}
                />
              </div>
              <div>
                <ChoresSection
                  chores={data.chores}
                  users={data.users}
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
            partners={data.partners}
            recentContributions={data.recentContributions}
            goals={data.goals}
            onOpenDepositModal={handleOpenDepositModal}
            onDeleteContribution={handleDeleteContribution}
            onUpdateUserTarget={handleUpdateUserTarget}
          />
        )}

        {activeTab === "metas" && (
          <GoalsSection
            goals={data.goals}
            onOpenGoalModal={() => setGoalModalOpen(true)}
            onOpenDepositModal={handleOpenDepositModal}
            onDeleteGoal={handleDeleteGoal}
            onEditGoalTarget={handleEditGoalTarget}
          />
        )}

        {activeTab === "enxoval" && (
          <WishlistSection
            wishlist={data.wishlist}
            users={data.users}
            onOpenWishlistModal={() => setWishlistModalOpen(true)}
            onUpdateStatus={handleUpdateWishlistStatus}
            onDeleteItem={handleDeleteWishlistItem}
          />
        )}

        {activeTab === "contas" && (
          <ExpensesSection
            expenses={data.expenses}
            users={data.users}
            balances={data.balances}
            onOpenExpenseModal={() => setExpenseModalOpen(true)}
            onTogglePaid={handleToggleExpensePaid}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === "tarefas" && (
          <ChoresSection
            chores={data.chores}
            users={data.users}
            onToggleChore={handleToggleChore}
            onAddChore={handleAddChore}
            onDeleteChore={handleDeleteChore}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 hidden sm:block">
        Nosso Apê 🏠 • Gestão Financeira e Planejamento de Casal (Gabriel & Carol) • Dados persistentes no banco SQLite
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
        users={data.users}
        goals={data.goals}
        initialUserId={selectedUserIdForDeposit}
        initialGoalId={selectedGoalIdForDeposit}
        onSuccess={fetchData}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
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
        users={data.users}
        onSuccess={fetchData}
      />
    </div>
  );
}