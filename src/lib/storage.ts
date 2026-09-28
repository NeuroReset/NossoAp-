import { DashboardData, Goal, User, Apartment, Contribution, Expense, WishlistItem, Chore } from "@/types";

const STORAGE_KEY = "nossoape_app_data_v1";

const defaultInitialData: DashboardData = {
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

export function getLocalData(): DashboardData {
  if (typeof window === "undefined") return defaultInitialData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLocalData(defaultInitialData);
      return defaultInitialData;
    }
    return JSON.parse(raw);
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

export function recalculateDashboard(data: DashboardData): DashboardData {
  const users = data.users;
  const allContribs = data.recentContributions || [];
  const expenses = data.expenses || [];
  const wishlist = data.wishlist || [];
  const chores = data.chores || [];

  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth();

  // 1. Contributions per goal
  const goals = (data.goals || []).map((g) => {
    const goalContribs = allContribs.filter((c) => c.goalId === g.id);
    const currentAmount = goalContribs.reduce((s, c) => s + c.amount, 0);
    return {
      ...g,
      currentAmount,
      isCompleted: g.targetAmount > 0 ? currentAmount >= g.targetAmount : false,
      contributionsCount: goalContribs.length,
    };
  });

  // 2. Totals
  const totalSaved = allContribs.reduce((s, c) => s + c.amount, 0);
  const totalBudget = data.apartment?.totalBudget || 0;
  const budgetProgressPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSaved / totalBudget) * 100)) : 0;

  // 3. Current month
  const curMonthContribs = allContribs.filter((c) => {
    const d = new Date(c.date);
    return d.getFullYear() === curY && d.getMonth() === curM;
  });
  const currentMonthTotal = curMonthContribs.reduce((s, c) => s + c.amount, 0);
  const currentMonthTarget = users.reduce((s, u) => s + (u.monthlyTarget || 0), 0);
  const currentMonthProgressPercent =
    currentMonthTarget > 0 ? Math.min(100, Math.round((currentMonthTotal / currentMonthTarget) * 100)) : 0;

  // 4. Partners
  const partners = users.map((u) => {
    const uCurMonth = curMonthContribs.filter((c) => c.userId === u.id);
    const curTotal = uCurMonth.reduce((s, c) => s + c.amount, 0);
    const target = u.monthlyTarget || 0;
    const progressPercent = target > 0 ? Math.min(100, Math.round((curTotal / target) * 100)) : 0;
    
    const uHistory = allContribs.filter((c) => c.userId === u.id);
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

  // 5. Monthly History (Last 6 months)
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
      const cd = new Date(c.date);
      if (cd.getFullYear() === y && cd.getMonth() === m) {
        item.total += c.amount;
        const u = users.find((usr) => usr.id === c.userId);
        if (u && item[u.name] !== undefined) {
          item[u.name] += c.amount;
        }
      }
    });

    monthlyHistory.push(item);
  }

  // 6. Expenses
  const curMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.dueDate);
    return d.getFullYear() === curY && d.getMonth() === curM;
  });
  const totalExpensesThisMonth = curMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const pendingExpensesThisMonth = curMonthExpenses.filter((e) => !e.isPaid).reduce((s, e) => s + e.amount, 0);

  // 7. Balances
  let balances = {
    userA: users[0] || null,
    userB: users[1] || null,
    userAPaid: 0,
    userBPaid: 0,
    debtorName: null as string | null,
    creditorName: null as string | null,
    settlementAmount: 0,
    isBalanced: true,
  };

  if (users.length >= 2) {
    const paid = curMonthExpenses.filter((e) => e.isPaid);
    const u1Paid = paid.filter((e) => e.paidById === users[0].id).reduce((s, e) => s + e.amount, 0);
    const u2Paid = paid.filter((e) => e.paidById === users[1].id).reduce((s, e) => s + e.amount, 0);
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

  // 8. Wishlist
  const wishlistTotalEstimated = wishlist.reduce((s, i) => s + i.estimatedPrice, 0);
  const wishlistTotalSpent = wishlist.filter((i) => i.actualPrice).reduce((s, i) => s + (i.actualPrice || 0), 0);
  const wishlistItemsPurchasedCount = wishlist.filter((i) => i.status === "COMPRADO" || i.status === "ENTREGUE").length;

  return {
    ...data,
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
  };
}