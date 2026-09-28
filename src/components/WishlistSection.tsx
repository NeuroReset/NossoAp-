"use client";

import React, { useState } from "react";
import { Plus, Check, ExternalLink, Trash2, ShoppingBag, BedDouble, Utensils, Armchair, Bath, Trees, Sparkles } from "lucide-react";
import { WishlistItem, User } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface WishlistSectionProps {
  wishlist: WishlistItem[];
  users: User[];
  onOpenWishlistModal: () => void;
  onUpdateStatus: (id: string, status: string, actualPrice?: number, boughtById?: string) => void;
  onDeleteItem: (id: string) => void;
}

const roomIcons: Record<string, any> = {
  TODOS: Sparkles,
  SALA: Armchair,
  COZINHA: Utensils,
  QUARTO_CASAL: BedDouble,
  BANHEIRO: Bath,
  VARANDA: Trees,
  LAVANDERIA: ShoppingBag,
};

export function WishlistSection({
  wishlist,
  users,
  onOpenWishlistModal,
  onUpdateStatus,
  onDeleteItem,
}: WishlistSectionProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("TODOS");
  const [selectedStatus, setSelectedStatus] = useState<string>("TODOS");

  const rooms = ["TODOS", "COZINHA", "SALA", "QUARTO_CASAL", "BANHEIRO", "VARANDA", "LAVANDERIA"];

  const filteredItems = wishlist.filter((item) => {
    const matchRoom = selectedRoom === "TODOS" || item.room === selectedRoom;
    const matchStatus = selectedStatus === "TODOS" || item.status === selectedStatus;
    return matchRoom && matchStatus;
  });

  const totalEstimated = wishlist.reduce((s, i) => s + i.estimatedPrice, 0);
  const totalSpent = wishlist.filter((i) => i.actualPrice).reduce((s, i) => s + (i.actualPrice || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Stats */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-200">
            Enxoval, Móveis & Decoração
          </span>
          <h3 className="text-xl sm:text-2xl font-black mt-1">Guia de Compras do Apê</h3>
          <p className="text-xs text-purple-200 mt-1">
            Planejamento cômodo por cômodo para não estourar o orçamento da mudança
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-purple-200">Total Já Comprado</div>
            <div className="text-xl font-bold text-white">{formatCurrency(totalSpent)}</div>
          </div>
          <button
            onClick={onOpenWishlistModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Room Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {rooms.map((room) => {
          const Icon = roomIcons[room] || Sparkles;
          const count =
            room === "TODOS" ? wishlist.length : wishlist.filter((i) => i.room === room).length;

          return (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedRoom === room
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {room === "TODOS"
                  ? "Todos os Cômodos"
                  : room === "COZINHA"
                  ? "Cozinha"
                  : room === "SALA"
                  ? "Sala de Estar"
                  : room === "QUARTO_CASAL"
                  ? "Quarto Casal"
                  : room === "BANHEIRO"
                  ? "Banheiro"
                  : room === "VARANDA"
                  ? "Varanda"
                  : "Lavanderia"}
              </span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">Nenhum item cadastrado nesta categoria.</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "Adicionar Item" para montar a lista do enxoval.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isBought = item.status === "COMPRADO" || item.status === "ENTREGUE";

            return (
              <div
                key={item.id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                  isBought ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {item.room} • {item.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-2">
                        {item.name}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        item.priority === "ALTA"
                          ? "bg-rose-100 text-rose-700"
                          : item.priority === "MEDIA"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{item.notes}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Preço Estimado</div>
                      <div className="text-sm font-semibold text-slate-700">
                        {formatCurrency(item.estimatedPrice)}
                      </div>
                    </div>

                    {item.actualPrice && (
                      <div className="text-right">
                        <div className="text-[11px] text-emerald-600 font-semibold">Preço Pago</div>
                        <div className="text-base font-black text-emerald-600">
                          {formatCurrency(item.actualPrice)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Abrir link do produto"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isBought ? (
                    <button
                      onClick={() => onUpdateStatus(item.id, "DESEJO")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Comprado
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const priceStr = prompt("Valor real pago (R$):", String(item.estimatedPrice));
                        const price = priceStr ? parseFloat(priceStr.replace(",", ".")) : item.estimatedPrice;
                        onUpdateStatus(item.id, "COMPRADO", price);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      Marcar Comprado
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}