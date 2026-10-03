import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Converte qualquer formato numérico (ex: "3.000,11", "3000,11", "3000.11", "3.000", "R$ 1.500,50")
 * em um número Float de forma robusta e à prova de falhas.
 */
export function parseBRL(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;

  let str = String(value).trim();
  if (!str) return 0;

  // Remove caracteres que não sejam dígitos, vírgula, ponto ou sinal de menos
  str = str.replace(/[^\d.,-]/g, "");

  // Trata casos com múltiplos separadores
  if (str.includes(".") && str.includes(",")) {
    const lastDot = str.lastIndexOf(".");
    const lastComma = str.lastIndexOf(",");
    if (lastComma > lastDot) {
      // Padrão brasileiro: 3.000.000,11 -> remove pontos, vírgula vira ponto
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // Padrão americano: 3,000,000.11 -> remove vírgulas
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    // Apenas vírgula: 3000,11 -> 3000.11
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(".")) {
    // Apenas ponto(s)
    const parts = str.split(".");
    if (parts.length > 2) {
      // Ex: 1.000.000
      str = parts.join("");
    } else if (parts.length === 2) {
      // Se tiver 3 dígitos após o ponto (ex: 3.000), é milhar
      if (parts[1].length === 3) {
        str = parts[0] + parts[1];
      }
    }
  }

  const result = parseFloat(str);
  return isNaN(result) ? 0 : result;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatMonthYear(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(d);
}
