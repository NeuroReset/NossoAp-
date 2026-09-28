import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: { paidBy: true },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar despesas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paidById, title, category, amount, dueDate, splitType, isPaid, notes } = body;

    if (!paidById || !title || !amount || !dueDate) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    let apartment = await prisma.apartment.findFirst();
    if (!apartment) {
      return NextResponse.json({ error: "Apartamento não cadastrado" }, { status: 404 });
    }

    const expense = await prisma.expense.create({
      data: {
        apartmentId: apartment.id,
        paidById,
        title,
        category: category || "OUTRO",
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        splitType: splitType || "EQUAL_50_50",
        isPaid: Boolean(isPaid),
        paidDate: isPaid ? new Date() : null,
        notes: notes || null,
      },
      include: { paidBy: true },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar despesa" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isPaid } = body;

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        isPaid,
        paidDate: isPaid ? new Date() : null,
      },
      include: { paidBy: true },
    });

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar despesa" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar despesa" }, { status: 500 });
  }
}