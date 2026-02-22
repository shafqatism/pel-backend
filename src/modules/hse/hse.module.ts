import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident, SafetyAudit, HseDrill } from './entities/hse.entity';
import { HseService } from './services/hse.service';
import { HseController } from './controllers/hse.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, SafetyAudit, HseDrill])],
  controllers: [HseController],
  providers: [HseService],
  exports: [HseService],
})
export class HseModule {}
