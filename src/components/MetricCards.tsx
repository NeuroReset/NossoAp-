"use client";

import React from "react";
import { PiggyBank, ShoppingBag, Receipt, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricCardsProps {
  summary: {
    totalSaved: number;
    totalBudget: number;
    budgetProgressPercent: number;
    currentMonthTotal: number;
    currentMonthTarget: number;
    currentMonthProgressPercent: number;
    totalExpensesThisMonth: number;
    pendingExpensesThisMonth: number;
    wishlistTotalEstimated: number;
    wishlistTotalSpent: number;
    wishlistItemsPurchasedCount: number;
    wishlistItemsTotalCount: number;
  };
}

export function MetricCards({ summary }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Total Guardado */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Patrimônio
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {formatCurrency(summary.totalSaved)}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
            <span className="truncate">Meta: {summary.totalBudget > 0 ? formatCurrency(summary.totalBudget) : "A definir"}</span>
            {summary.totalBudget > 0 && (
              <span className="font-bold text-emerald-600 ml-1">{summary.budgetProgressPercent}%</span>
            )}
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: summary.totalBudget > 0 ? `${summary.budgetProgressPercent}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* 2. Aportes do Mês */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Aportes do Mês
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {formatCurrency(summary.currentMonthTotal)}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
            <span className="truncate">Meta: {summary.currentMonthTarget > 0 ? formatCurrency(summary.currentMonthTarget) : "A definir"}</span>
            {summary.currentMonthTarget > 0 && (
              <span className="font-bold text-blue-600 ml-1">{summary.currentMonthProgressPercent}%</span>
            )}
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: summary.currentMonthTarget > 0 ? `${summary.currentMonthProgressPercent}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* 3. Enxoval & Móveis */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Enxoval & Móveis
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {formatCurrency(summary.wishlistTotalSpent)}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
            <span className="truncate">Orçado: {formatCurrency(summary.wishlistTotalEstimated)}</span>
            <span className="font-bold text-purple-600 ml-1">
              {summary.wishlistItemsPurchasedCount}/{summary.wishlistItemsTotalCount}
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out"
              style={{
                width: summary.wishlistItemsTotalCount > 0
                  ? `${Math.round((summary.wishlistItemsPurchasedCount / summary.wishlistItemsTotalCount) * 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Contas do Mês */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            Contas do Mês
          </span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
        <div className="mt-2 sm:mt-3">
          <div className="text-base sm:text-2xl font-black text-slate-900 tracking-tight truncate">
            {formatCurrency(summary.totalExpensesThisMonth)}
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
            <span className="truncate">Pendente:</span>
            <span
              className={`font-bold ml-1 ${
                summary.pendingExpensesThisMonth > 0 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {formatCurrency(summary.pendingExpensesThisMonth)}
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
              style={{
                width: summary.totalExpensesThisMonth > 0
                  ? `${Math.round(
                      ((summary.totalExpensesThisMonth - summary.pendingExpensesThisMonth) /
                        summary.totalExpensesThisMonth) *
                        100
                    )}%`
                  : "100%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}