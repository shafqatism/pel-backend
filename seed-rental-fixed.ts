import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.landRental.create({
    data: {
      landOwnerName: 'Gul Hassan',
      landOwnerCnic: '42101-1234567-1',
      location: 'Kirthar Block B',
      district: 'Dadu',
      province: 'Sindh',
      areaAcres: 12.5,
      monthlyRent: 45000,
      leaseStartDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      status: 'active',
      purpose: 'Drilling Pad A1',
    }
  });
  console.log('Land rental seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
