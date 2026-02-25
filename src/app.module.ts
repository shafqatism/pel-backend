import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { HrModule } from './modules/hr/hr.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { SitesModule } from './modules/sites/sites.module';
import { FoodModule } from './modules/food/food.module';
import { LandRentalModule } from './modules/land-rental/land-rental.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MediaModule } from './modules/media/media.module';
import { HseModule } from './modules/hse/hse.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PrismaModule } from './prisma/prisma.module';
import { DropdownsModule } from './modules/dropdowns/dropdowns.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { CompaniesModule } from './modules/companies/companies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    HseModule,
    SettingsModule,
    DropdownsModule,
    PrismaModule,
    SeederModule,
    CompaniesModule,
  ],
})
export class AppModule {}
