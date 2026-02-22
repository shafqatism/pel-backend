import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandRental } from './entities/land-rental.entity';
import { LandRentalService } from './services/land-rental.service';
import { LandRentalController } from './controllers/land-rental.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LandRental])],
  controllers: [LandRentalController],
  providers: [LandRentalService],
  exports: [LandRentalService],
})
export class LandRentalModule {}
