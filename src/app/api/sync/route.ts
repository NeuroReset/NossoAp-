import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    const { apartment, users, goals, recentContributions, expenses, wishlist, chores } = body || {};

    let syncedGoals = 0;
    let syncedContributions = 0;
    let syncedExpenses = 0;
    let syncedWishlist = 0;
    let syncedChores = 0;

    // 1. Apartment
    let dbApe = await prisma.apartment.findFirst().catch(() => null);
    if (!dbApe) {
      dbApe = await prisma.apartment.create({
        data: {
          name: apartment?.name || "Nosso Apê 🏠",
          address: apartment?.address || "Endereço em definição",
          totalBudget: parseFloat(String(apartment?.totalBudget || 0)) || 150000,
          inviteCode: apartment?.inviteCode || "GABRIEL-CAROL",
        },
      });
    } else if (apartment?.totalBudget && parseFloat(String(apartment.totalBudget)) > 0) {
      await prisma.apartment.update({
        where: { id: dbApe.id },
        data: { totalBudget: parseFloat(String(apartment.totalBudget)) },
      }).catch(() => null);
    }

    // 2. Users (Gabriel & Carol)
    let dbUsers = await prisma.user.findMany().catch(() => []);
    if (!dbUsers || dbUsers.length === 0) {
      const u1 = await prisma.user.create({
        data: {
          name: "Gabriel",
          email: "gabriel@nossoape.com",
          avatarColor: "#3b82f6",
          role: "OWNER",
          monthlyTarget: 2500,
        },
      });
      const u2 = await prisma.user.create({
        data: {
          name: "Carol",
          email: "carol@nossoape.com",
          avatarColor: "#ec4899",
          role: "OWNER",
          monthlyTarget: 2500,
        },
      });
      dbUsers = [u1, u2];
    }

    const gabriel = dbUsers.find((u) => u.name.toLowerCase().includes("gabriel")) || dbUsers[0];
    const carol = dbUsers.find((u) => u.name.toLowerCase().includes("carol")) || dbUsers[1] || dbUsers[0];

    const resolveUserId = (uId?: string, uName?: string) => {
      const str = String(uId || uName || "").toLowerCase();
      if (str.includes("carol")) return carol.id;
      return gabriel.id;
    };

    // 3. Goals (Metas / Caixinhas)
    if (goals && Array.isArray(goals)) {
      for (const g of goals) {
        if (!g || !g.title) continue;
        const targetAmount = parseFloat(String(g.targetAmount || 0)) || 0;
        
        let existing = null;
        if (g.id) {
          existing = await prisma.goal.findUnique({ where: { id: String(g.id) } }).catch(() => null);
        }
        if (!existing) {
          existing = await prisma.goal.findFirst({ where: { title: String(g.title) } }).catch(() => null);
        }

        if (!existing) {
          await prisma.goal.create({
            data: {
              apartmentId: dbApe.id,
              title: String(g.title),
              description: g.description ? String(g.description) : null,
              category: String(g.category || "GERAL"),
              targetAmount,
              color: String(g.color || "#10b981"),
              icon: String(g.icon || "PiggyBank"),
              deadline: g.deadline ? new Date(g.deadline) : null,
              isCompleted: Boolean(g.isCompleted),
            },
          }).catch((e) => console.error("Goal create error:", e));
          syncedGoals++;
        } else {
          await prisma.goal.update({
            where: { id: existing.id },
            data: {
              ...(targetAmount > 0 && { targetAmount }),
              ...(g.deadline && { deadline: new Date(g.deadline) }),
              ...(g.description && { description: String(g.description) }),
              ...(g.color && { color: String(g.color) }),
            },
          }).catch(() => null);
          syncedGoals++;
        }
      }
    }

    // 4. Contributions (Aportes)
    if (recentContributions && Array.isArray(recentContributions)) {
      for (const c of recentContributions) {
        if (!c) continue;
        const uId = resolveUserId(c.userId, c.user?.name);
        const amount = parseFloat(String(c.amount || 0));
        if (!amount || isNaN(amount) || amount <= 0) continue;

        let existing = null;
        if (c.id) {
          existing = await prisma.contribution.findUnique({ where: { id: String(c.id) } }).catch(() => null);
        }

        if (!existing) {
          let validGoalId: string | null = null;
          if (c.goalId || c.goal?.title) {
            const dbGoal = await prisma.goal.findFirst({
              where: {
                OR: [
                  ...(c.goalId ? [{ id: String(c.goalId) }] : []),
                  ...(c.goal?.title ? [{ title: String(c.goal.title) }] : []),
                ],
              },
            }).catch(() => null);
            if (dbGoal) validGoalId = dbGoal.id;
          }

          const cDate = c.date ? new Date(c.date) : new Date();
          const validDate = isNaN(cDate.getTime()) ? new Date() : cDate;

          await prisma.contribution.create({
            data: {
              apartmentId: dbApe.id,
              userId: uId,
              goalId: validGoalId,
              amount,
              date: validDate,
              notes: c.notes ? String(c.notes) : null,
            },
          }).catch((e) => console.error("Contribution create error:", e));
          syncedContributions++;
        }
      }
    }

    // 5. Expenses (Despesas)
    if (expenses && Array.isArray(expenses)) {
      for (const e of expenses) {
        if (!e || !e.title) continue;
        const uId = resolveUserId(e.paidById, e.paidBy?.name);
        const amount = parseFloat(String(e.amount || 0));
        if (!amount || isNaN(amount) || amount <= 0) continue;

        let existing = null;
        if (e.id) {
          existing = await prisma.expense.findUnique({ where: { id: String(e.id) } }).catch(() => null);
        }

        if (!existing) {
          const eDate = e.dueDate ? new Date(e.dueDate) : new Date();
          const validDueDate = isNaN(eDate.getTime()) ? new Date() : eDate;

          await prisma.expense.create({
            data: {
              apartmentId: dbApe.id,
              paidById: uId,
              title: String(e.title),
              category: String(e.category || "OUTRO"),
              amount,
              dueDate: validDueDate,
              paidDate: e.isPaid ? new Date() : null,
              isPaid: Boolean(e.isPaid),
              splitType: String(e.splitType || "EQUAL_50_50"),
              notes: e.notes ? String(e.notes) : null,
            },
          }).catch((e) => console.error("Expense create error:", e));
          syncedExpenses++;
        }
      }
    }

    // 6. Wishlist (Enxoval)
    if (wishlist && Array.isArray(wishlist)) {
      for (const w of wishlist) {
        if (!w || !w.name) continue;
        let existing = null;
        if (w.id) {
          existing = await prisma.wishlistItem.findUnique({ where: { id: String(w.id) } }).catch(() => null);
        }
        if (!existing) {
          existing = await prisma.wishlistItem.findFirst({ where: { name: String(w.name) } }).catch(() => null);
        }

        if (!existing) {
          const estimatedPrice = parseFloat(String(w.estimatedPrice || 0)) || 0;
          const actualPrice = w.actualPrice ? parseFloat(String(w.actualPrice)) : null;

          await prisma.wishlistItem.create({
            data: {
              apartmentId: dbApe.id,
              name: String(w.name),
              room: String(w.room || "SALA"),
              category: String(w.category || "MOVEIS"),
              estimatedPrice,
              actualPrice: actualPrice && !isNaN(actualPrice) ? actualPrice : null,
              status: String(w.status || "DESEJO"),
              priority: String(w.priority || "ALTA"),
              productUrl: w.productUrl ? String(w.productUrl) : null,
              notes: w.notes ? String(w.notes) : null,
            },
          }).catch((e) => console.error("Wishlist create error:", e));
          syncedWishlist++;
        }
      }
    }

    // 7. Chores (Tarefas)
    if (chores && Array.isArray(chores)) {
      for (const ch of chores) {
        if (!ch || !ch.title) continue;
        let existing = null;
        if (ch.id) {
          existing = await prisma.chore.findUnique({ where: { id: String(ch.id) } }).catch(() => null);
        }
        if (!existing) {
          existing = await prisma.chore.findFirst({ where: { title: String(ch.title) } }).catch(() => null);
        }

        if (!existing) {
          const uId = ch.assignedToId ? resolveUserId(ch.assignedToId, ch.assignedTo?.name) : null;
          await prisma.chore.create({
            data: {
              apartmentId: dbApe.id,
              title: String(ch.title),
              assignedToId: uId,
              frequency: String(ch.frequency || "SEMANAL"),
              isDone: Boolean(ch.isDone),
            },
          }).catch((e) => console.error("Chore create error:", e));
          syncedChores++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      counts: {
        goals: syncedGoals,
        contributions: syncedContributions,
        expenses: syncedExpenses,
        wishlist: syncedWishlist,
        chores: syncedChores,
      },
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Erro na sincronização", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

