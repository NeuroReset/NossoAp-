import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.wishlistItem.findMany({
      include: { boughtBy: true },
      orderBy: [{ status: "asc" }, { priority: "asc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar itens da lista" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { room, name, category, estimatedPrice, priority, productUrl, notes } = body;

    if (!name || !estimatedPrice) {
      return NextResponse.json({ error: "Nome e pre?o estimado s?o obrigat?rios" }, { status: 400 });
    }

    let apartment = await prisma.apartment.findFirst();
    if (!apartment) {
      return NextResponse.json({ error: "Apartamento n?o cadastrado" }, { status: 404 });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        apartmentId: apartment.id,
        room: room || "SALA",
        name,
        category: category || "MOVEIS",
        estimatedPrice: parseFloat(estimatedPrice),
        priority: priority || "MEDIA",
        status: "DESEJO",
        productUrl: productUrl || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, actualPrice, boughtById } = body;

    if (!id) return NextResponse.json({ error: "ID obrigat?rio" }, { status: 400 });

    const item = await prisma.wishlistItem.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(actualPrice !== undefined && { actualPrice: actualPrice ? parseFloat(actualPrice) : null }),
        ...(boughtById !== undefined && { boughtById: boughtById || null }),
        ...(status === "COMPRADO" && { boughtDate: new Date() }),
      },
      include: { boughtBy: true },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigat?rio" }, { status: 400 });

    await prisma.wishlistItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar item" }, { status: 500 });
  }
}
