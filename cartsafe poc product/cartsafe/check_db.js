import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("=== STORES ===");
  const stores = await prisma.store.findMany();
  console.log(JSON.stringify(stores, null, 2));

  console.log("=== HELD ORDERS ===");
  const orders = await prisma.heldOrder.findMany();
  console.log(JSON.stringify(orders, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
