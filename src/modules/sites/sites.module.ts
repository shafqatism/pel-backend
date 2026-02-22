import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectSite } from './entities/site.entity';
import { SitesService } from './services/sites.service';
import { SitesController } from './controllers/sites.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectSite])],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
