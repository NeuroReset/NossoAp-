"use client";

import React, { useState } from "react";
import { Lock, Heart, KeyRound, ArrowRight, Eye, EyeOff } from "lucide-react";

interface LockScreenProps {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Senha definida: carolinda16.
    if (password === "carolinda16.") {
      localStorage.setItem("nossoape_auth", "true");
      onUnlock();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 text-center text-white">
        {/* Heart Icon & Couple Names */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-pink-500 p-0.5 mx-auto shadow-xl shadow-emerald-500/20">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black mt-4 tracking-tight">
          Nosso Apê 🏠
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gabriel & Carol
        </p>

        {/* Lock Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative text-left">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                error
                  ? "border-rose-500 focus:ring-rose-500/30"
                  : "border-white/10 focus:border-emerald-500 focus:ring-emerald-500/30"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium animate-shake">
              Senha incorreta. Tente novamente!
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Entrar no Apê</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <p className="text-[11px] text-slate-500 mt-6 text-center">
        Acesso restrito ao casal
      </p>
    </div>
  );
}