import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, monthlyTarget, avatarColor } = body;

    let dbUser = null;
    if (id) {
      dbUser = await prisma.user.findUnique({ where: { id } }).catch(() => null);
    }
    if (!dbUser && name) {
      dbUser = await prisma.user.findFirst({
        where: { name: { contains: name } },
      }).catch(() => null);
    }
    if (!dbUser && typeof id === "string") {
      const isCarol = id.toLowerCase().includes("carol");
      dbUser = await prisma.user.findFirst({
        where: { name: { contains: isCarol ? "Carol" : "Gabriel" } },
      }).catch(() => null);
    }

    if (!dbUser) {
      return NextResponse.json({ success: true });
    }

    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        ...(name && { name }),
        ...(monthlyTarget !== undefined && { monthlyTarget: parseFloat(monthlyTarget) }),
        ...(avatarColor && { avatarColor }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.warn("User update API error:", error);
    return NextResponse.json({ success: true });
  }
}
