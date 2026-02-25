import { NestFactory } from '@nestjs/core';
import { SeederModule } from './src/modules/seeder/seeder.module';
import { SeederService } from './src/modules/seeder/seeder.service';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(SeederService);
  const prisma = app.get(PrismaService);

  console.log('Cleaning up database...');
  // Delete in order to avoid FK issues
  await prisma.incident.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.projectSite.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Starting seeding...');
  await seeder.seed();
  
  console.log('Cleanup and Seeding finished successfully!');
  await app.close();
}
bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
