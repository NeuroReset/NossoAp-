"use client";

import React from "react";
import { Building2, Plus, Sparkles, KeyRound, LogOut } from "lucide-react";
import { Apartment, User } from "@/types";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  apartment: Apartment;
  users: User[];
  onOpenDepositModal: () => void;
  onOpenGoalModal: () => void;
  onOpenWishlistModal: () => void;
  onOpenExpenseModal: () => void;
  onLockApp?: () => void;
}

export function Header({
  apartment,
  users,
  onOpenDepositModal,
  onLockApp,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Left: Icon & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  {apartment.name || "Nosso Apê 🏠"}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Em Planejamento
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                <span>{apartment.address || "Endereço em definição"}</span>
                {apartment.targetDate && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 ml-1">
                    • <KeyRound className="w-3 h-3" /> Chaves: {formatDate(apartment.targetDate)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Couple Avatars & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Couple Avatars */}
            <div className="flex items-center -space-x-1.5">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] sm:text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: u.avatarColor || "#3b82f6" }}
                  title={u.name}
                >
                  {u.name.slice(0, 1).toUpperCase()}
                </div>
              ))}
            </div>

            {/* Quick Action Button (Desktop Only) */}
            <button
              onClick={onOpenDepositModal}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aporte</span>
            </button>

            {/* Lock / Exit Button */}
            {onLockApp && (
              <button
                onClick={onLockApp}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Bloquear aplicativo"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}