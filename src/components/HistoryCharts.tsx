"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { User } from "@/types";

interface HistoryChartsProps {
  monthlyHistory: any[];
  users: User[];
  totalSaved: number;
}

export function HistoryCharts({ monthlyHistory, users, totalSaved }: HistoryChartsProps) {
  const partnerColors = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b"];
  const hasData = totalSaved > 0;

  const pieData = users.map((u, idx) => {
    const userTotal = monthlyHistory.reduce((sum, item) => sum + (item[u.name] || 0), 0);
    return {
      name: u.name,
      value: userTotal,
      color: u.avatarColor || partnerColors[idx % partnerColors.length],
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Area Chart: Monthly Evolution */}
      <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Evolução Mensal de Aportes</h3>
          <p className="text-xs text-slate-500">Histórico de depósitos do casal ao longo dos meses</p>
        </div>

        <div className="h-64 sm:h-72 w-full flex items-center justify-center">
          {!hasData ? (
            <div className="text-center text-slate-400 text-xs py-10">
              <p className="font-semibold text-slate-500">Nenhum dado financeiro acumulado ainda.</p>
              <p className="mt-1 text-slate-400">Os gráficos serão gerados automaticamente conforme os aportes forem feitos.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), "Aportado"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                {users.map((u, idx) => (
                  <Area
                    key={u.id}
                    type="monotone"
                    dataKey={u.name}
                    stackId="1"
                    stroke={u.avatarColor || partnerColors[idx]}
                    fill={u.avatarColor || partnerColors[idx]}
                    fillOpacity={0.3}
                    name={u.name}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie Chart: Participation Share */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Divisão de Participação</h3>
          <p className="text-xs text-slate-500">Proporção total guardada por cada parceiro</p>
        </div>

        <div className="h-52 w-full flex items-center justify-center my-auto">
          {!hasData ? (
            <div className="text-center text-slate-400 text-xs">
              Aguardando primeiros aportes
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), "Total Aportado"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          {users.map((u) => {
            const userTotal = monthlyHistory.reduce((sum, item) => sum + (item[u.name] || 0), 0);
            const pct = totalSaved > 0 ? Math.round((userTotal / totalSaved) * 100) : 0;
            return (
              <div key={u.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: u.avatarColor }} />
                  <span className="font-medium text-slate-700">{u.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{formatCurrency(userTotal)}</span>
                  <span className="text-slate-400 font-semibold">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}