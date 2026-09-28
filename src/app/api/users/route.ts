import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usu?rios" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, monthlyTarget, avatarColor } = body;

    if (!id) return NextResponse.json({ error: "ID obrigat?rio" }, { status: 400 });

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(monthlyTarget !== undefined && { monthlyTarget: parseFloat(monthlyTarget) }),
        ...(avatarColor && { avatarColor }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar usu?rio" }, { status: 500 });
  }
}
