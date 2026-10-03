import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apartment, users, goals, recentContributions, expenses, wishlist, chores } = body;

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
      // Atualiza metas mensais se fornecidas
      for (const u of dbUsers) {
        const matchingLocal = users?.find((lu: any) => lu.name?.toLowerCase().includes(u.name.toLowerCase()));
        if (matchingLocal && matchingLocal.monthlyTarget !== undefined) {
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

    // 3. Goals
    if (goals && Array.isArray(goals)) {
      for (const g of goals) {
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
              targetAmount: parseFloat(g.targetAmount || 0),
              color: g.color || "#10b981",
              icon: g.icon || "PiggyBank",
              deadline: g.deadline ? new Date(g.deadline) : null,
              isCompleted: Boolean(g.isCompleted),
            },
          }).catch(() => null);
        } else {
          await prisma.goal.update({
            where: { id: existing.id },
            data: {
              targetAmount: parseFloat(g.targetAmount || existing.targetAmount),
              deadline: g.deadline ? new Date(g.deadline) : existing.deadline,
              description: g.description !== undefined ? g.description : existing.description,
              color: g.color || existing.color,
            },
          }).catch(() => null);
        }
      }
    }

    // 4. Contributions (Aportes)
    if (recentContributions && Array.isArray(recentContributions)) {
      for (const c of recentContributions) {
        const uId = resolveUserId(c.userId, c.user?.name);
        const existing = await prisma.contribution.findFirst({
          where: {
            AND: [
              { userId: uId },
              { amount: parseFloat(c.amount) },
              { notes: c.notes || null },
            ],
          },
        });
        if (!existing && c.amount > 0) {
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
              amount: parseFloat(c.amount),
              date: c.date ? new Date(c.date) : new Date(),
              notes: c.notes || null,
            },
          }).catch(() => null);
        }
      }
    }

    // 5. Expenses (Despesas)
    if (expenses && Array.isArray(expenses)) {
      for (const e of expenses) {
        const uId = resolveUserId(e.paidById, e.paidBy?.name);
        const existing = await prisma.expense.findFirst({
          where: {
            AND: [
              { title: e.title },
              { amount: parseFloat(e.amount) },
            ],
          },
        });
        if (!existing && e.amount > 0) {
          await prisma.expense.create({
            data: {
              apartmentId: dbApe.id,
              paidById: uId,
              title: e.title,
              category: e.category || "OUTRO",
              amount: parseFloat(e.amount),
              dueDate: e.dueDate ? new Date(e.dueDate) : new Date(),
              paidDate: e.isPaid ? new Date() : null,
              isPaid: Boolean(e.isPaid),
              splitType: e.splitType || "EQUAL_50_50",
            },
          }).catch(() => null);
        }
      }
    }

    // 6. Wishlist (Enxoval)
    if (wishlist && Array.isArray(wishlist)) {
      for (const w of wishlist) {
        const existing = await prisma.wishlistItem.findFirst({
          where: { name: w.name },
        });
        if (!existing && w.name) {
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
        }
      }
    }

    // 7. Chores (Tarefas)
    if (chores && Array.isArray(chores)) {
      for (const ch of chores) {
        const existing = await prisma.chore.findFirst({
          where: { title: ch.title },
        });
        if (!existing && ch.title) {
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
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Erro na sincronização" }, { status: 500 });
  }
}
