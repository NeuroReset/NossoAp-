"use client";

import React from "react";
import { TrendingUp, PiggyBank, Target, ShoppingBag, Receipt, Plus } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "geral" | "aportes" | "metas" | "enxoval" | "contas" | "tarefas";
  onSelectTab: (tab: "geral" | "aportes" | "metas" | "enxoval" | "contas" | "tarefas") => void;
  onOpenDepositModal: () => void;
}

export function MobileBottomNav({
  activeTab,
  onSelectTab,
  onOpenDepositModal,
}: MobileBottomNavProps) {
  const tabs = [
    { id: "geral", label: "Início", icon: TrendingUp },
    { id: "aportes", label: "Aportes", icon: PiggyBank },
    { id: "metas", label: "Metas", icon: Target },
    { id: "enxoval", label: "Enxoval", icon: ShoppingBag },
    { id: "contas", label: "Contas", icon: Receipt },
  ] as const;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 transition-all rounded-xl active:scale-90 ${
                isActive
                  ? "text-emerald-600 font-bold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? "bg-emerald-50 text-emerald-600 scale-105" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Central Floating Action Button */}
        <button
          onClick={onOpenDepositModal}
          className="flex flex-col items-center justify-center py-1 px-1 text-emerald-600 active:scale-90 transition-transform"
          title="Novo Aporte"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 mt-0.5">Aporte</span>
        </button>
      </div>
    </nav>
  );
}