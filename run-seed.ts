import { NestFactory } from '@nestjs/core';
import { SeederModule } from './src/modules/seeder/seeder.module';
import { SeederService } from './src/modules/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  const seeder = app.get(SeederService);
  await seeder.seed();
  await app.close();
}
bootstrap();
