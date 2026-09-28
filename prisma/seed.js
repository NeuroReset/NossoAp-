const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Limpando banco de dados...");
  await prisma.chore.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();
  await prisma.apartment.deleteMany();

  console.log("Criando Apartamento (Gabriel & Carol)...");
  const ape = await prisma.apartment.create({
    data: {
      name: "Nosso Apê 🏠",
      address: "Endereço em definição",
      targetDate: null,
      totalBudget: 0.0,
      inviteCode: "GABRIEL-CAROL",
    },
  });

  console.log("Criando Usuários (Gabriel & Carol)...");
  await prisma.user.create({
    data: {
      name: "Gabriel",
      email: "gabriel@nossoape.com",
      avatarColor: "#3b82f6",
      role: "OWNER",
      monthlyTarget: 0.0,
    },
  });

  await prisma.user.create({
    data: {
      name: "Carol",
      email: "carol@nossoape.com",
      avatarColor: "#ec4899",
      role: "OWNER",
      monthlyTarget: 0.0,
    },
  });

  console.log("Criando Metas e Caixinhas...");
  const defaultGoals = [
    { title: "Entrada do Imóvel", description: "Reserva para entrada do financiamento", category: "ENTRADA", targetAmount: 0.0, color: "#10b981", icon: "KeyRound" },
    { title: "Reforma & Obra", description: "Pisos, iluminação, pintura e reparos", category: "REFORMA", targetAmount: 0.0, color: "#f59e0b", icon: "Hammer" },
    { title: "Marcenaria Planejada", description: "Armários da cozinha, sala, quartos e banheiros", category: "MARCENARIA", targetAmount: 0.0, color: "#8b5cf6", icon: "PaintBucket" },
    { title: "Eletrodomésticos", description: "Geladeira, fogão/cooktop, lava e seca, TV", category: "ELETROS", targetAmount: 0.0, color: "#06b6d4", icon: "Tv" },
    { title: "Documentação & ITBI", description: "Taxas de cartório, escritura e ITBI", category: "DOCUMENTACAO", targetAmount: 0.0, color: "#ef4444", icon: "FileText" },
  ];

  for (const g of defaultGoals) {
    await prisma.goal.create({
      data: {
        apartmentId: ape.id,
        ...g,
      },
    });
  }

  console.log("Banco pronto e limpo para Gabriel & Carol!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });