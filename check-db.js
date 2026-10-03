const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Vypxdj1408*@db.mbxdzkjgktiwtsgdohcb.supabase.co:5432/postgres",
    },
  },
});

async function main() {
  const users = await prisma.user.findMany();
  const contributions = await prisma.contribution.findMany({
    include: { user: true, goal: true },
  });
  const expenses = await prisma.expense.findMany();
  const wishlist = await prisma.wishlistItem.findMany();
  const goals = await prisma.goal.findMany();

  console.log("=== SUPABASE LIVE DATA ===");
  console.log("Users:", users.map((u) => ({ id: u.id, name: u.name, monthlyTarget: u.monthlyTarget })));
  console.log("Goals count:", goals.length);
  console.log("Contributions count:", contributions.length);
  console.log("Contributions:", contributions);
  console.log("Expenses count:", expenses.length);
  console.log("Wishlist count:", wishlist.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
