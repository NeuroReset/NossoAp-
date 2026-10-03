"use client";

import React, { useState } from "react";
import { X, Database, Copy, Check, UploadCloud, DownloadCloud, AlertCircle } from "lucide-react";
import { getLocalData, saveLocalData, recalculateDashboard } from "@/lib/storage";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BackupModal({ isOpen, onClose, onSuccess }: BackupModalProps) {
  const [jsonText, setJsonText] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const data = getLocalData();
    const formatted = JSON.stringify(data, null, 2);
    setJsonText(formatted);
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleImportToSupabase = async () => {
    if (!jsonText.trim()) {
      setMessage({ type: "error", text: "Cole os dados JSON no campo de texto primeiro." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const parsed = JSON.parse(jsonText);

      // 1. Salva localmente
      const recalculated = recalculateDashboard(parsed);
      saveLocalData(recalculated);

      // 2. Envia para o Supabase
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recalculated),
      });

      const resJson = await res.json().catch(() => null);

      if (res.ok && resJson?.counts) {
        const c = resJson.counts;
        setMessage({
          type: "success",
          text: `Sucesso! Foram enviados para o Supabase: ${c.contributions} aportes, ${c.goals} metas, ${c.expenses} despesas e ${c.wishlist} itens do enxoval.`,
        });
        onSuccess();
      } else {
        setMessage({
          type: "success",
          text: "Dados importados e salvos localmente com sucesso!",
        });
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Formato de dados inválido. Certifique-se de colar o JSON completo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Migração & Backup de Dados</h3>
              <p className="text-xs text-slate-400">Transferir dados entre computadores e enviar para a nuvem</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Opção 1: Copiar do PC atual */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DownloadCloud className="w-4 h-4 text-blue-600" />
                1. No PC de quem preencheu (Carol):
              </span>
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copiado!" : "Copiar Dados do Painel"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Clique no botão acima para copiar todos os dados que estão salvos neste computador para a área de transferência.
            </p>
          </div>

          {/* Opção 2: Colar e Enviar para o Supabase */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              2. Colar Dados e Salvar no Banco Supabase:
            </label>
            <textarea
              rows={5}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Cole o código dos dados aqui..."
              className="w-full p-3 font-mono text-[11px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700"
            />
          </div>

          <button
            type="button"
            onClick={handleImportToSupabase}
            disabled={loading || !jsonText.trim()}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{loading ? "Gravando no Banco Supabase..." : "Gravar Tudo no Banco Supabase"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
