import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const models = ['user', 'settings', 'vehicle', 'trip', 'fuelLog', 'maintenanceRecord', 'employee', 'expense', 'incident', 'safetyAudit', 'hseDrill', 'projectSite', 'document', 'foodMess', 'landRental'];
  
  console.log('Database Status Check:');
  for (const model of models) {
    try {
      const count = await (prisma as any)[model].count();
      console.log(`${model}: ${count} records`);
    } catch (e) {
      console.log(`${model}: Error or not found`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
