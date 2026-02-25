import { Module } from '@nestjs/common';
import { HseService } from './services/hse.service';
import { HseController } from './controllers/hse.controller';

@Module({
  controllers: [HseController],
  providers: [HseService],
  exports: [HseService],
})
export class HseModule {}
