import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      include: {
        contributions: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = goals.map((g) => ({
      ...g,
      currentAmount: g.contributions.reduce((s, c) => s + c.amount, 0),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar metas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, category, targetAmount, color, icon, deadline } = body;

    if (!title) {
      return NextResponse.json({ error: "Título da meta é obrigatório" }, { status: 400 });
    }

    let apartment = await prisma.apartment.findFirst();
    if (!apartment) {
      return NextResponse.json({ error: "Apartamento não cadastrado" }, { status: 404 });
    }

    const goal = await prisma.goal.create({
      data: {
        apartmentId: apartment.id,
        title,
        description: description || null,
        category: category || "GERAL",
        targetAmount: parseFloat(targetAmount || 0),
        color: color || "#10b981",
        icon: icon || "PiggyBank",
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar meta" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isCompleted, title, description, targetAmount, deadline, color, category } = body;

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(isCompleted !== undefined && { isCompleted }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(color && { color }),
        ...(targetAmount !== undefined && { targetAmount: parseFloat(targetAmount) }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar meta" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    // Desvincular ou deletar meta
    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar meta:", error);
    return NextResponse.json({ error: "Erro ao deletar caixinha/meta" }, { status: 500 });
  }
}