import { Module } from '@nestjs/common';
import { SitesService } from './services/sites.service';
import { SitesController } from './controllers/sites.controller';

@Module({
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
