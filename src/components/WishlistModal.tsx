"use client";

import React, { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { WishlistItem } from "@/types";
import { getLocalData, saveLocalData, recalculateDashboard } from "@/lib/storage";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WishlistModal({ isOpen, onClose, onSuccess }: WishlistModalProps) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("SALA");
  const [category, setCategory] = useState("MOVEIS");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [priority, setPriority] = useState("ALTA");
  const [productUrl, setProductUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !estimatedPrice) return;

    setLoading(true);
    const parsedPrice = parseFloat(estimatedPrice.replace(",", "."));

    const newItem: WishlistItem = {
      id: "item-" + Date.now(),
      apartmentId: "default-ape",
      room,
      name,
      category,
      estimatedPrice: parsedPrice,
      priority: priority as any,
      status: "DESEJO",
      productUrl: productUrl || null,
      notes: notes || null,
    };

    const local = getLocalData();
    local.wishlist = [newItem, ...(local.wishlist || [])];
    const recalculated = recalculateDashboard(local);
    saveLocalData(recalculated);

    onSuccess();
    onClose();
    setName("");
    setEstimatedPrice("");
    setProductUrl("");
    setNotes("");
    setLoading(false);

    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          room,
          category,
          estimatedPrice: parsedPrice,
          priority,
          productUrl: productUrl || null,
          notes: notes || null,
        }),
      });
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        <div className="bg-purple-900 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-300" />
            <h3 className="font-bold text-base">Adicionar Item ao Enxoval</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-purple-300 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Item</label>
            <input
              type="text"
              required
              placeholder="Ex: Cama Box Queen, Geladeira Inox, Cooktop..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cômodo</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="SALA">Sala de Estar</option>
                <option value="COZINHA">Cozinha</option>
                <option value="QUARTO_CASAL">Quarto Casal</option>
                <option value="BANHEIRO">Banheiro</option>
                <option value="VARANDA">Varanda</option>
                <option value="LAVANDERIA">Lavanderia</option>
                <option value="GERAL">Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preço Estimado (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="3.500,00"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
              >
                <option value="ALTA">Alta (Essencial)</option>
                <option value="MEDIA">Média</option>
                <option value="BAIXA">Baixa (Desejo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link do Produto</label>
              <input
                type="url"
                placeholder="https://..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações / Medidas</label>
            <input
              type="text"
              placeholder="Ex: Medir vão da tomada, voltagem 220V..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            {loading ? "Salvando..." : "Salvar no Enxoval"}
          </button>
        </form>
      </div>
    </div>
  );
}