import { Module } from '@nestjs/common';
import { DropdownsService } from './services/dropdowns.service';
import { DropdownsController } from './controllers/dropdowns.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DropdownsController],
  providers: [DropdownsService],
  exports: [DropdownsService],
})
export class DropdownsModule {}
