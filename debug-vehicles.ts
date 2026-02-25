import { NestFactory } from '@nestjs/core';
import { FleetModule } from './src/modules/fleet/fleet.module';
import { VehiclesService } from './src/modules/fleet/services/vehicles.service';
import { PrismaModule } from './src/prisma/prisma.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(FleetModule);
  const svc = app.get(VehiclesService);
  const result = await svc.findAll({ page: 1, limit: 10 });
  console.log('Result:', JSON.stringify(result, null, 2));
  await app.close();
}
bootstrap();
