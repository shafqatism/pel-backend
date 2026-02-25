import { NestFactory } from '@nestjs/core';
import { SeederModule } from './src/modules/seeder/seeder.module';
import { SeederService } from './src/modules/seeder/seeder.service';
import { PrismaService } from './src/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const prisma = app.get(PrismaService);
  const seeder = app.get(SeederService);

  console.log('Cleaning up data for re-seed...');
  await prisma.landRental.deleteMany();
  // We can just add the land rental without full reset if we want, 
  // but let's just run the seed() method directly.
  await seeder.seed();

  console.log('Seed completed!');
  await app.close();
}
bootstrap();
