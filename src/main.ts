import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // ─── Multipart Support ───
  const multipart = await import('@fastify/multipart');
  await app.register(multipart.default || multipart);

  // ─── Global Prefix ───
  app.setGlobalPrefix('api');

  // ─── CORS ───
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:5173',
    'https://pel-frontend.vercel.app',
    /^https:\/\/pel-frontend.*\.vercel\.app$/,
    process.env.FRONTEND_URL,
  ].filter((o): o is string | RegExp => !!o);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // ─── Validation ───
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: false,
    }),
  );

  // ─── Swagger ───
  const config = new DocumentBuilder()
    .setTitle('PEL ERP API')
    .setDescription(
      'Petroleum Exploration Limited — Enterprise Resource Planning System',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Authorization')
    .addTag('fleet - vehicles', 'Vehicle Registry & Management')
    .addTag('fleet - trips', 'Trip Logging & Tracking')
    .addTag('fleet - fuel', 'Fuel Consumption Records')
    .addTag('fleet - maintenance', 'Service & Repair Records')
    .addTag('fleet - assignments', 'Vehicle Assignments')
    .addTag('fleet - reports', 'Fleet Analytics & Reports')
    .addTag('hr - employees', 'Employee Directory')
    .addTag('hr - attendance', 'Attendance Tracking')
    .addTag('finance - expenses', 'Expense Management')
    .addTag('project-sites', 'Project Sites & Operations')
    .addTag('food-mess', 'Food & Mess Management')
    .addTag('land-rentals', 'Land & Rental Agreements')
    .addTag('documents', 'Document Management')
    .addTag('media', 'File Upload & Storage')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
    },
    customSiteTitle: 'PEL ERP — API Docs',
  });

  // ─── Start ───
  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 PEL ERP API running at http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
}

bootstrap();
