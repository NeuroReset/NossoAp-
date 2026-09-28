import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chores = await prisma.chore.findMany({
      include: { assignedTo: true },
      orderBy: [{ isDone: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(chores);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, assignedToId, frequency } = body;

    if (!title) return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });

    let apartment = await prisma.apartment.findFirst();
    if (!apartment) return NextResponse.json({ error: "Apartamento não cadastrado" }, { status: 404 });

    const chore = await prisma.chore.create({
      data: {
        apartmentId: apartment.id,
        title,
        assignedToId: assignedToId || null,
        frequency: frequency || "SEMANAL",
        isDone: false,
      },
      include: { assignedTo: true },
    });

    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isDone } = body;

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const chore = await prisma.chore.update({
      where: { id },
      data: {
        isDone,
        lastDoneAt: isDone ? new Date() : null,
      },
      include: { assignedTo: true },
    });

    return NextResponse.json(chore);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await prisma.chore.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar tarefa" }, { status: 500 });
  }
}