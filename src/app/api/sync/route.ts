import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apartment, users, goals, recentContributions, expenses, wishlist, chores } = body;

    let syncedGoals = 0;
    let syncedContributions = 0;
    let syncedExpenses = 0;
    let syncedWishlist = 0;
    let syncedChores = 0;

    // 1. Apartment
    let dbApe = await prisma.apartment.findFirst();
    if (!dbApe) {
      dbApe = await prisma.apartment.create({
        data: {
          name: apartment?.name || "Nosso Apê 🏠",
          address: apartment?.address || "Endereço em definição",
          totalBudget: parseFloat(apartment?.totalBudget || 0),
          inviteCode: apartment?.inviteCode || "GABRIEL-CAROL",
        },
      });
    } else if (apartment?.totalBudget && parseFloat(apartment.totalBudget) > 0) {
      await prisma.apartment.update({
        where: { id: dbApe.id },
        data: { totalBudget: parseFloat(apartment.totalBudget) },
      }).catch(() => null);
    }

    // 2. Users (Gabriel & Carol)
    let dbUsers = await prisma.user.findMany();
    if (dbUsers.length === 0) {
      const u1 = await prisma.user.create({
        data: {
          name: "Gabriel",
          email: "gabriel@nossoape.com",
          avatarColor: "#3b82f6",
          role: "OWNER",
          monthlyTarget: parseFloat(users?.find((u: any) => u.name?.toLowerCase().includes("gabriel"))?.monthlyTarget || 0),
        },
      });
      const u2 = await prisma.user.create({
        data: {
          name: "Carol",
          email: "carol@nossoape.com",
          avatarColor: "#ec4899",
          role: "OWNER",
          monthlyTarget: parseFloat(users?.find((u: any) => u.name?.toLowerCase().includes("carol"))?.monthlyTarget || 0),
        },
      });
      dbUsers = [u1, u2];
    } else {
      for (const u of dbUsers) {
        const matchingLocal = users?.find((lu: any) => lu.name?.toLowerCase().includes(u.name.toLowerCase()));
        if (matchingLocal && matchingLocal.monthlyTarget !== undefined && parseFloat(matchingLocal.monthlyTarget) > 0) {
          await prisma.user.update({
            where: { id: u.id },
            data: { monthlyTarget: parseFloat(matchingLocal.monthlyTarget) },
          }).catch(() => null);
        }
      }
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
        const targetAmount = parseFloat(g.targetAmount || 0);
        const existing = await prisma.goal.findFirst({
          where: {
            OR: [
              { id: g.id },
              { title: g.title },
            ],
          },
        });

        if (!existing) {
          await prisma.goal.create({
            data: {
              apartmentId: dbApe.id,
              title: g.title,
              description: g.description || null,
              category: g.category || "GERAL",
              targetAmount,
              color: g.color || "#10b981",
              icon: g.icon || "PiggyBank",
              deadline: g.deadline ? new Date(g.deadline) : null,
              isCompleted: Boolean(g.isCompleted),
            },
          }).catch(() => null);
          syncedGoals++;
        } else {
          await prisma.goal.update({
            where: { id: existing.id },
            data: {
              ...(targetAmount > 0 && { targetAmount }),
              ...(g.deadline && { deadline: new Date(g.deadline) }),
              ...(g.description && { description: g.description }),
              ...(g.color && { color: g.color }),
            },
          }).catch(() => null);
          syncedGoals++;
        }
      }
    }

    // 4. Contributions (Aportes)
    if (recentContributions && Array.isArray(recentContributions)) {
      for (const c of recentContributions) {
        const uId = resolveUserId(c.userId, c.user?.name);
        const amount = parseFloat(c.amount);
        if (amount <= 0) continue;

        const existing = await prisma.contribution.findFirst({
          where: {
            OR: [
              { id: c.id },
              { AND: [{ userId: uId }, { amount }] },
            ],
          },
        });

        if (!existing) {
          let validGoalId = null;
          if (c.goalId || c.goal?.title) {
            const dbGoal = await prisma.goal.findFirst({
              where: {
                OR: [
                  { id: c.goalId || "none" },
                  { title: c.goal?.title || "none" },
                ],
              },
            });
            if (dbGoal) validGoalId = dbGoal.id;
          }

          await prisma.contribution.create({
            data: {
              apartmentId: dbApe.id,
              userId: uId,
              goalId: validGoalId,
              amount,
              date: c.date ? new Date(c.date) : new Date(),
              notes: c.notes || null,
            },
          }).catch(() => null);
          syncedContributions++;
        }
      }
    }

    // 5. Expenses (Despesas)
    if (expenses && Array.isArray(expenses)) {
      for (const e of expenses) {
        const uId = resolveUserId(e.paidById, e.paidBy?.name);
        const amount = parseFloat(e.amount);
        if (amount <= 0) continue;

        const existing = await prisma.expense.findFirst({
          where: {
            OR: [
              { id: e.id },
              { AND: [{ title: e.title }, { amount }] },
            ],
          },
        });

        if (!existing) {
          await prisma.expense.create({
            data: {
              apartmentId: dbApe.id,
              paidById: uId,
              title: e.title,
              category: e.category || "OUTRO",
              amount,
              dueDate: e.dueDate ? new Date(e.dueDate) : new Date(),
              paidDate: e.isPaid ? new Date() : null,
              isPaid: Boolean(e.isPaid),
              splitType: e.splitType || "EQUAL_50_50",
            },
          }).catch(() => null);
          syncedExpenses++;
        }
      }
    }

    // 6. Wishlist (Enxoval)
    if (wishlist && Array.isArray(wishlist)) {
      for (const w of wishlist) {
        if (!w.name) continue;
        const existing = await prisma.wishlistItem.findFirst({
          where: {
            OR: [
              { id: w.id },
              { name: w.name },
            ],
          },
        });

        if (!existing) {
          await prisma.wishlistItem.create({
            data: {
              apartmentId: dbApe.id,
              name: w.name,
              room: w.room || "SALA",
              category: w.category || "MOVEIS",
              estimatedPrice: parseFloat(w.estimatedPrice || 0),
              actualPrice: w.actualPrice ? parseFloat(w.actualPrice) : null,
              status: w.status || "DESEJO",
              priority: w.priority || "ALTA",
              productUrl: w.productUrl || null,
              notes: w.notes || null,
            },
          }).catch(() => null);
          syncedWishlist++;
        }
      }
    }

    // 7. Chores (Tarefas)
    if (chores && Array.isArray(chores)) {
      for (const ch of chores) {
        if (!ch.title) continue;
        const existing = await prisma.chore.findFirst({
          where: {
            OR: [
              { id: ch.id },
              { title: ch.title },
            ],
          },
        });

        if (!existing) {
          const uId = ch.assignedToId ? resolveUserId(ch.assignedToId, ch.assignedTo?.name) : null;
          await prisma.chore.create({
            data: {
              apartmentId: dbApe.id,
              title: ch.title,
              assignedToId: uId,
              frequency: ch.frequency || "SEMANAL",
              isDone: Boolean(ch.isDone),
            },
          }).catch(() => null);
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
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Erro na sincronização" }, { status: 500 });
  }
}
