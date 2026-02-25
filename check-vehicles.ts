import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  console.log('Vehicles in DB:', vehicles.length);
  console.log(JSON.stringify(vehicles, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
