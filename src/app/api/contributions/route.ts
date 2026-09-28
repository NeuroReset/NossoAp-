import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { userId, goalId, amount, date, notes } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: "Usu?rio e valor s?o obrigat?rios" }, { status: 400 });
    }

    let apartment = await prisma.apartment.findFirst();
    if (!apartment) {
      return NextResponse.json({ error: "Apartamento n?o cadastrado" }, { status: 404 });
    }

    const contribution = await prisma.contribution.create({
      data: {
        apartmentId: apartment.id,
        userId,
        goalId: goalId || null,
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
    if (!id) return NextResponse.json({ error: "ID obrigat?rio" }, { status: 400 });

    await prisma.contribution.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar aporte" }, { status: 500 });
  }
}
