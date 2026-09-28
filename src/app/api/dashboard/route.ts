import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let apartment = await prisma.apartment.findFirst();
    if (!apartment) {
      return NextResponse.json({ error: "Apartamento n?o encontrado" }, { status: 404 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });

    const goalsRaw = await prisma.goal.findMany({
      where: { apartmentId: apartment.id },
      include: {
        contributions: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const allContributions = await prisma.contribution.findMany({
      where: { apartmentId: apartment.id },
      include: {
        user: true,
        goal: true,
      },
      orderBy: { date: "desc" },
    });

    const expenses = await prisma.expense.findMany({
      where: { apartmentId: apartment.id },
      include: { paidBy: true },
      orderBy: { dueDate: "asc" },
    });

    const wishlist = await prisma.wishlistItem.findMany({
      where: { apartmentId: apartment.id },
      include: { boughtBy: true },
      orderBy: [{ status: "asc" }, { priority: "asc" }],
    });

    const chores = await prisma.chore.findMany({
      where: { apartmentId: apartment.id },
      include: { assignedTo: true },
      orderBy: [{ isDone: "asc" }, { createdAt: "desc" }],
    });

    // 1. Calculate Goals Progress
    const goals = goalsRaw.map((g) => {
      const currentAmount = g.contributions.reduce((sum, c) => sum + c.amount, 0);
      return {
        id: g.id,
        apartmentId: g.apartmentId,
        title: g.title,
        description: g.description,
        category: g.category,
        targetAmount: g.targetAmount,
        currentAmount,
        color: g.color,
        icon: g.icon,
        deadline: g.deadline ? g.deadline.toISOString() : null,
        isCompleted: currentAmount >= g.targetAmount || g.isCompleted,
        contributionsCount: g.contributions.length,
      };
    });

    // 2. Total Guardado
    const totalSaved = allContributions.reduce((sum, c) => sum + c.amount, 0);
    const totalBudget = apartment.totalBudget;
    const budgetProgressPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSaved / totalBudget) * 100)) : 0;

    // 3. Current Month Calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthContributions = allContributions.filter((c) => {
      const d = new Date(c.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const currentMonthTotal = currentMonthContributions.reduce((sum, c) => sum + c.amount, 0);
    const currentMonthTarget = users.reduce((sum, u) => sum + u.monthlyTarget, 0);
    const currentMonthProgressPercent =
      currentMonthTarget > 0 ? Math.min(100, Math.round((currentMonthTotal / currentMonthTarget) * 100)) : 0;

    // 4. Partner Details
    const partners = users.map((u) => {
      const uCurrentMonthContribs = currentMonthContributions.filter((c) => c.userId === u.id);
      const currentMonthTotal = uCurrentMonthContribs.reduce((sum, c) => sum + c.amount, 0);
      const target = u.monthlyTarget;
      const progressPercent = target > 0 ? Math.min(100, Math.round((currentMonthTotal / target) * 100)) : 0;
      
      const uHistoricalContribs = allContributions.filter((c) => c.userId === u.id);
      const historicalTotal = uHistoricalContribs.reduce((sum, c) => sum + c.amount, 0);
      const historicalPercent = totalSaved > 0 ? Math.round((historicalTotal / totalSaved) * 100) : 0;

      return {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          avatarColor: u.avatarColor,
          role: u.role,
          monthlyTarget: u.monthlyTarget,
        },
        target,
        currentMonthTotal,
        progressPercent,
        isCompleted: currentMonthTotal >= target,
        historicalTotal,
        historicalPercent,
      };
    });

    // 5. Monthly History (Last 6 months)
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyHistoryMap = new Map<string, any>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, "0")}`;
      const label = `${monthNames[m]} ${String(y).slice(2)}`;

      const item: any = {
        monthKey: key,
        monthLabel: label,
        total: 0,
      };
      users.forEach((u) => {
        item[u.name] = 0;
      });
      monthlyHistoryMap.set(key, item);
    }

    allContributions.forEach((c) => {
      const d = new Date(c.date);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, "0")}`;
      if (monthlyHistoryMap.has(key)) {
        const item = monthlyHistoryMap.get(key);
        item.total += c.amount;
        if (c.user && item[c.user.name] !== undefined) {
          item[c.user.name] += c.amount;
        }
      }
    });

    const monthlyHistory = Array.from(monthlyHistoryMap.values());

    // 6. Expenses Breakdown & Balances
    const currentMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.dueDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const totalExpensesThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingExpensesThisMonth = currentMonthExpenses
      .filter((e) => !e.isPaid)
      .reduce((sum, e) => sum + e.amount, 0);

    // Balance between User 1 and User 2 (if 2 users exist)
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
      const paidExpenses = currentMonthExpenses.filter((e) => e.isPaid);
      const u1Paid = paidExpenses.filter((e) => e.paidById === users[0].id).reduce((sum, e) => sum + e.amount, 0);
      const u2Paid = paidExpenses.filter((e) => e.paidById === users[1].id).reduce((sum, e) => sum + e.amount, 0);

      balances.userAPaid = u1Paid;
      balances.userBPaid = u2Paid;

      // Equal 50/50 split check
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

    // 7. Wishlist Summary
    const wishlistTotalEstimated = wishlist.reduce((sum, item) => sum + item.estimatedPrice, 0);
    const wishlistTotalSpent = wishlist
      .filter((i) => i.actualPrice)
      .reduce((sum, item) => sum + (item.actualPrice || 0), 0);
    const wishlistItemsPurchasedCount = wishlist.filter(
      (i) => i.status === "COMPRADO" || i.status === "ENTREGUE"
    ).length;

    // 8. Chores Summary
    const choresCompletedCount = chores.filter((c) => c.isDone).length;

    return NextResponse.json({
      apartment: {
        id: apartment.id,
        name: apartment.name,
        address: apartment.address,
        targetDate: apartment.targetDate ? apartment.targetDate.toISOString() : null,
        totalBudget: apartment.totalBudget,
        inviteCode: apartment.inviteCode,
      },
      users,
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
        choresCompletedCount,
        choresTotalCount: chores.length,
      },
      partners,
      goals,
      monthlyHistory,
      recentContributions: allContributions.slice(0, 8),
      expenses,
      wishlist,
      chores,
      balances,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do painel" }, { status: 500 });
  }
}
