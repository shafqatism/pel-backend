import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { HrModule } from './modules/hr/hr.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { SitesModule } from './modules/sites/sites.module';
import { FoodModule } from './modules/food/food.module';
import { LandRentalModule } from './modules/land-rental/land-rental.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // DEV MODE: Auto-sync schema
        ssl: { rejectUnauthorized: false },
        logging: false,
      }),
    }),
    AuthModule,
    FleetModule,
    HrModule,
    ExpensesModule,
    SitesModule,
    FoodModule,
    LandRentalModule,
    DocumentsModule,
    MediaModule,
  ],
})
export class AppModule {}
