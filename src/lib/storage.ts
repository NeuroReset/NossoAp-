import { DashboardData, Goal, User, Apartment, Contribution, Expense, WishlistItem, Chore } from "@/types";

const STORAGE_KEY = "nossoape_app_data_v1";

export const defaultInitialData: DashboardData = {
  apartment: {
    id: "default-ape",
    name: "Nosso Apê 🏠",
    address: "Endereço em definição",
    targetDate: null,
    totalBudget: 0.0,
    inviteCode: "GABRIEL-CAROL",
  },
  users: [
    {
      id: "user-gabriel",
      name: "Gabriel",
      email: "gabriel@nossoape.com",
      avatarColor: "#3b82f6",
      role: "OWNER",
      monthlyTarget: 0.0,
    },
    {
      id: "user-carol",
      name: "Carol",
      email: "carol@nossoape.com",
      avatarColor: "#ec4899",
      role: "OWNER",
      monthlyTarget: 0.0,
    },
  ],
  summary: {
    totalSaved: 0,
    totalBudget: 0,
    budgetProgressPercent: 0,
    currentMonthTotal: 0,
    currentMonthTarget: 0,
    currentMonthProgressPercent: 0,
    totalExpensesThisMonth: 0,
    pendingExpensesThisMonth: 0,
    wishlistTotalEstimated: 0,
    wishlistTotalSpent: 0,
    wishlistItemsPurchasedCount: 0,
    wishlistItemsTotalCount: 5,
    choresCompletedCount: 0,
    choresTotalCount: 0,
  },
  partners: [
    {
      user: {
        id: "user-gabriel",
        name: "Gabriel",
        email: "gabriel@nossoape.com",
        avatarColor: "#3b82f6",
        role: "OWNER",
        monthlyTarget: 0.0,
      },
      target: 0,
      currentMonthTotal: 0,
      progressPercent: 0,
      isCompleted: false,
      historicalTotal: 0,
      historicalPercent: 0,
    },
    {
      user: {
        id: "user-carol",
        name: "Carol",
        email: "carol@nossoape.com",
        avatarColor: "#ec4899",
        role: "OWNER",
        monthlyTarget: 0.0,
      },
      target: 0,
      currentMonthTotal: 0,
      progressPercent: 0,
      isCompleted: false,
      historicalTotal: 0,
      historicalPercent: 0,
    },
  ],
  goals: [
    { id: "g1", apartmentId: "default-ape", title: "Entrada do Imóvel", description: "Reserva para entrada do financiamento", category: "ENTRADA", targetAmount: 0, currentAmount: 0, color: "#10b981", icon: "KeyRound", isCompleted: false },
    { id: "g2", apartmentId: "default-ape", title: "Reforma & Obra", description: "Pisos, iluminação, pintura e reparos", category: "REFORMA", targetAmount: 0, currentAmount: 0, color: "#f59e0b", icon: "Hammer", isCompleted: false },
    { id: "g3", apartmentId: "default-ape", title: "Marcenaria Planejada", description: "Armários da cozinha, sala, quartos e banheiros", category: "MARCENARIA", targetAmount: 0, currentAmount: 0, color: "#8b5cf6", icon: "PaintBucket", isCompleted: false },
    { id: "g4", apartmentId: "default-ape", title: "Eletrodomésticos", description: "Geladeira, fogão/cooktop, lava e seca, TV", category: "ELETROS", targetAmount: 0, currentAmount: 0, color: "#06b6d4", icon: "Tv", isCompleted: false },
    { id: "g5", apartmentId: "default-ape", title: "Documentação & ITBI", description: "Taxas de cartório, escritura e ITBI", category: "DOCUMENTACAO", targetAmount: 0, currentAmount: 0, color: "#ef4444", icon: "FileText", isCompleted: false },
  ],
  monthlyHistory: [],
  recentContributions: [],
  expenses: [],
  wishlist: [],
  chores: [],
  balances: {
    userA: { id: "user-gabriel", name: "Gabriel", email: "gabriel@nossoape.com", avatarColor: "#3b82f6", role: "OWNER", monthlyTarget: 0 },
    userB: { id: "user-carol", name: "Carol", email: "carol@nossoape.com", avatarColor: "#ec4899", role: "OWNER", monthlyTarget: 0 },
    userAPaid: 0,
    userBPaid: 0,
    debtorName: null,
    creditorName: null,
    settlementAmount: 0,
    isBalanced: true,
  },
};

/**
 * Helper resiliente para extrair ano e mês (0-indexado) sem distorção de fuso horário UTC
 */
export function getYearMonth(dateVal: string | Date | null | undefined): { year: number; month: number } {
  if (!dateVal) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  if (typeof dateVal === "string") {
    const match = dateVal.match(/^(\d{4})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10) - 1,
      };
    }
  }
  const d = new Date(dateVal);
  return { year: d.getFullYear(), month: d.getMonth() };
}

/**
 * Validação tolerante a IDs e nomes para Gabriel e Carol
 */
export function matchUser(u: User, userId?: string | null, userObj?: User | null): boolean {
  if (!u) return false;
  const uName = (u.name || "").trim().toLowerCase();
  
  if (userId && u.id && userId === u.id) return true;
  
  const objName = (userObj?.name || "").trim().toLowerCase();
  if (objName && uName === objName) return true;
  if (userObj?.id && u.id && userObj.id === u.id) return true;

  if (userId && typeof userId === "string") {
    const idLower = userId.toLowerCase();
    if (idLower === u.id.toLowerCase()) return true;
    if (uName.includes("carol") && (idLower.includes("carol") || idLower === "user-carol")) return true;
    if (uName.includes("gabriel") && (idLower.includes("gabriel") || idLower === "user-gabriel")) return true;
  }
  return false;
}

export function findCanonicalUser(users: User[], userId?: string | null, userObj?: User | null): User {
  const found = users.find((u) => matchUser(u, userId, userObj));
  if (found) return found;
  
  // Se ainda não encontrou, tenta buscar por nome 'carol' ou 'gabriel' no userId
  const str = String(userId || userObj?.name || "").toLowerCase();
  if (str.includes("carol")) {
    const carol = users.find((u) => u.name.toLowerCase().includes("carol"));
    if (carol) return carol;
  }
  if (str.includes("gabriel")) {
    const gabriel = users.find((u) => u.name.toLowerCase().includes("gabriel"));
    if (gabriel) return gabriel;
  }
  return users[0] || defaultInitialData.users[0];
}

export function getLocalData(): DashboardData {
  if (typeof window === "undefined") return defaultInitialData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLocalData(defaultInitialData);
      return defaultInitialData;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error("Storage read error:", e);
    return defaultInitialData;
  }
}

export function saveLocalData(data: DashboardData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

export function mergeServerAndLocal(server: DashboardData, local: DashboardData): DashboardData {
  const baseUsers = (server.users && server.users.length >= 2) ? server.users : (local.users && local.users.length >= 2 ? local.users : defaultInitialData.users);

  // Unifica aportes por ID preservando todos
  const contribMap = new Map<string, Contribution>();
  (local.recentContributions || []).forEach((c) => contribMap.set(c.id, c));
  (server.recentContributions || []).forEach((c) => contribMap.set(c.id, c));

  // Unifica despesas
  const expMap = new Map<string, Expense>();
  (local.expenses || []).forEach((e) => expMap.set(e.id, e));
  (server.expenses || []).forEach((e) => expMap.set(e.id, e));

  // Unifica wishlist
  const wishMap = new Map<string, WishlistItem>();
  (local.wishlist || []).forEach((w) => wishMap.set(w.id, w));
  (server.wishlist || []).forEach((w) => wishMap.set(w.id, w));

  // Unifica tarefas
  const choreMap = new Map<string, Chore>();
  (local.chores || []).forEach((ch) => choreMap.set(ch.id, ch));
  (server.chores || []).forEach((ch) => choreMap.set(ch.id, ch));

  // Unifica metas
  const goals = (local.goals && local.goals.length > 0) ? local.goals : (server.goals || defaultInitialData.goals);

  const merged: DashboardData = {
    ...defaultInitialData,
    apartment: server.apartment || local.apartment || defaultInitialData.apartment,
    users: baseUsers,
    goals,
    recentContributions: Array.from(contribMap.values()),
    expenses: Array.from(expMap.values()),
    wishlist: Array.from(wishMap.values()),
    chores: Array.from(choreMap.values()),
  };

  return recalculateDashboard(merged);
}

export function recalculateDashboard(data: DashboardData): DashboardData {
  const users = (data.users && data.users.length >= 2) ? data.users : defaultInitialData.users;
  
  // Normaliza e associa aportes aos usuários canônicos
  const allContribs: Contribution[] = (data.recentContributions || []).map((c) => {
    const canonical = findCanonicalUser(users, c.userId, c.user);
    return {
      ...c,
      userId: canonical.id,
      user: canonical,
      amount: Number(c.amount) || 0,
    };
  });

  // Normaliza e associa despesas aos usuários canônicos
  const expenses: Expense[] = (data.expenses || []).map((e) => {
    const canonical = findCanonicalUser(users, e.paidById, e.paidBy);
    return {
      ...e,
      paidById: canonical.id,
      paidBy: canonical,
      amount: Number(e.amount) || 0,
    };
  });

  const wishlist = data.wishlist || [];
  const chores = data.chores || [];

  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth();

  // 1. Contribuições por meta/caixinha
  const goals = (data.goals || defaultInitialData.goals).map((g) => {
    const goalContribs = allContribs.filter((c) => c.goalId === g.id);
    const currentAmount = goalContribs.reduce((s, c) => s + c.amount, 0);
    const targetAmount = Number(g.targetAmount) || 0;
    return {
      ...g,
      targetAmount,
      currentAmount,
      isCompleted: targetAmount > 0 ? currentAmount >= targetAmount : false,
      contributionsCount: goalContribs.length,
    };
  });

  // 2. Total Guardado Geral (Cofre do Apê)
  const totalSaved = allContribs.reduce((s, c) => s + c.amount, 0);
  const totalBudget = Number(data.apartment?.totalBudget) || 0;
  const budgetProgressPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSaved / totalBudget) * 100)) : 0;

  // 3. Aportes do Mês Vigente (Imune a timezone UTC)
  const curMonthContribs = allContribs.filter((c) => {
    const { year, month } = getYearMonth(c.date);
    return year === curY && month === curM;
  });
  const currentMonthTotal = curMonthContribs.reduce((s, c) => s + c.amount, 0);
  const currentMonthTarget = users.reduce((s, u) => s + (Number(u.monthlyTarget) || 0), 0);
  const currentMonthProgressPercent =
    currentMonthTarget > 0 ? Math.min(100, Math.round((currentMonthTotal / currentMonthTarget) * 100)) : 0;

  // 4. Progresso Individual de Cada Parceiro (Gabriel e Carol)
  const partners = users.map((u) => {
    const uCurMonth = curMonthContribs.filter((c) => matchUser(u, c.userId, c.user));
    const curTotal = uCurMonth.reduce((s, c) => s + c.amount, 0);
    const target = Number(u.monthlyTarget) || 0;
    const progressPercent = target > 0 ? Math.min(100, Math.round((curTotal / target) * 100)) : 0;
    
    const uHistory = allContribs.filter((c) => matchUser(u, c.userId, c.user));
    const histTotal = uHistory.reduce((s, c) => s + c.amount, 0);
    const histPct = totalSaved > 0 ? Math.round((histTotal / totalSaved) * 100) : 0;

    return {
      user: u,
      target,
      currentMonthTotal: curTotal,
      progressPercent,
      isCompleted: target > 0 && curTotal >= target,
      historicalTotal: histTotal,
      historicalPercent: histPct,
    };
  });

  // 5. Histórico dos últimos 6 meses
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyHistory: any[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(curY, curM - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    const label = `${monthNames[m]} ${String(y).slice(2)}`;

    const item: any = { monthKey: key, monthLabel: label, total: 0 };
    users.forEach((u) => {
      item[u.name] = 0;
    });

    allContribs.forEach((c) => {
      const { year: cy, month: cm } = getYearMonth(c.date);
      if (cy === y && cm === m) {
        item.total += c.amount;
        const u = findCanonicalUser(users, c.userId, c.user);
        if (u && item[u.name] !== undefined) {
          item[u.name] += c.amount;
        }
      }
    });

    monthlyHistory.push(item);
  }

  // 6. Despesas do Mês Atual
  const curMonthExpenses = expenses.filter((e) => {
    const { year, month } = getYearMonth(e.dueDate);
    return year === curY && month === curM;
  });
  const totalExpensesThisMonth = curMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const pendingExpensesThisMonth = curMonthExpenses.filter((e) => !e.isPaid).reduce((s, e) => s + e.amount, 0);

  // 7. Balanço de Acerto 50/50 (Gabriel vs Carol)
  let balances = {
    userA: users[0] || defaultInitialData.users[0],
    userB: users[1] || defaultInitialData.users[1],
    userAPaid: 0,
    userBPaid: 0,
    debtorName: null as string | null,
    creditorName: null as string | null,
    settlementAmount: 0,
    isBalanced: true,
  };

  if (users.length >= 2) {
    const paid = curMonthExpenses.filter((e) => e.isPaid);
    const u1Paid = paid.filter((e) => matchUser(users[0], e.paidById, e.paidBy)).reduce((s, e) => s + e.amount, 0);
    const u2Paid = paid.filter((e) => matchUser(users[1], e.paidById, e.paidBy)).reduce((s, e) => s + e.amount, 0);
    balances.userAPaid = u1Paid;
    balances.userBPaid = u2Paid;

    const diff = u1Paid - u2Paid;
    if (Math.abs(diff) > 0.01) {
      balances.isBalanced = false;
      balances.settlementAmount = Math.abs(diff) / 2;
      if (diff > 0) {
        balances.debtorName = users[1].name;
        balances.creditorName = users[0].name;
      } else {
        balances.debtorName = users[0].name;
        balances.creditorName = users[1].name;
      }
    }
  }

  // 8. Enxoval e Móveis
  const wishlistTotalEstimated = wishlist.reduce((s, i) => s + (Number(i.estimatedPrice) || 0), 0);
  const wishlistTotalSpent = wishlist.filter((i) => i.actualPrice).reduce((s, i) => s + (Number(i.actualPrice) || 0), 0);
  const wishlistItemsPurchasedCount = wishlist.filter((i) => i.status === "COMPRADO" || i.status === "ENTREGUE").length;

  return {
    ...data,
    users,
    goals,
    partners,
    monthlyHistory,
    summary: {
      totalSaved,
      totalBudget,
      budgetProgressPercent,
      currentMonthTotal,
      currentMonthTarget,
      currentMonthProgressPercent,
      totalExpensesThisMonth,
      pendingExpensesThisMonth,
      wishlistTotalEstimated,
      wishlistTotalSpent,
      wishlistItemsPurchasedCount,
      wishlistItemsTotalCount: wishlist.length,
      choresCompletedCount: chores.filter((c) => c.isDone).length,
      choresTotalCount: chores.length,
    },
    balances,
    recentContributions: allContribs,
    expenses,
  };
}