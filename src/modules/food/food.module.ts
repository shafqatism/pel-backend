import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodMess } from './entities/food-mess.entity';
import { FoodService } from './services/food.service';
import { FoodController } from './controllers/food.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FoodMess])],
  controllers: [FoodController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}
