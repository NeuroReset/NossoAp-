import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contributions = await prisma.contribution.findMany({
      include: {
        user: true,
        goal: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(contributions);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar aportes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userName, goalId, amount, date, notes } = body;

    if (!amount) {
      return NextResponse.json({ error: "Valor é obrigatório" }, { status: 400 });
    }

    let apartment = await prisma.apartment.findFirst();
    if (!apartment) {
      apartment = await prisma.apartment.create({
        data: {
          name: "Nosso Apê 🏠",
          totalBudget: 0.0,
          inviteCode: "GABRIEL-CAROL",
        },
      });
    }

    // Busca usuário flexível pelo ID ou pelo nome
    let dbUser = null;
    if (userId) {
      dbUser = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!dbUser && userName) {
      dbUser = await prisma.user.findFirst({
        where: { name: { contains: userName } },
      });
    }
    if (!dbUser && typeof userId === "string") {
      const isCarol = userId.toLowerCase().includes("carol");
      dbUser = await prisma.user.findFirst({
        where: { name: { contains: isCarol ? "Carol" : "Gabriel" } },
      });
    }
    if (!dbUser) {
      // Cria o usuário se não existir
      const isCarol = String(userName || userId).toLowerCase().includes("carol");
      dbUser = await prisma.user.create({
        data: {
          name: isCarol ? "Carol" : "Gabriel",
          email: isCarol ? "carol@nossoape.com" : "gabriel@nossoape.com",
          avatarColor: isCarol ? "#ec4899" : "#3b82f6",
          monthlyTarget: 0.0,
        },
      });
    }

    // Verifica se a meta existe no banco se fornecida
    let validGoalId = null;
    if (goalId) {
      const dbGoal = await prisma.goal.findUnique({ where: { id: goalId } });
      if (dbGoal) {
        validGoalId = dbGoal.id;
      }
    }

    const contribution = await prisma.contribution.create({
      data: {
        apartmentId: apartment.id,
        userId: dbUser.id,
        goalId: validGoalId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
      include: {
        user: true,
        goal: true,
      },
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar aporte:", error);
    return NextResponse.json({ error: "Erro ao registrar aporte" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await prisma.contribution.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar aporte" }, { status: 500 });
  }
}
