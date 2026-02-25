import { Module } from '@nestjs/common';
import { LandRentalService } from './services/land-rental.service';
import { LandRentalController } from './controllers/land-rental.controller';

@Module({
  controllers: [LandRentalController],
  providers: [LandRentalService],
  exports: [LandRentalService],
})
export class LandRentalModule {}
