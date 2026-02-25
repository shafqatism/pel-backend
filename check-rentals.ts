import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.landRental.count();
  console.log('Land Rentals Count:', count);
  const data = await prisma.landRental.findMany();
  console.log('Data:', JSON.stringify(data, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
