import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee, Attendance } from './entities';
import { EmployeesService } from './services/employees.service';
import { AttendanceService } from './services/attendance.service';
import { EmployeesController } from './controllers/employees.controller';
import { AttendanceController } from './controllers/attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Attendance])],
  controllers: [EmployeesController, AttendanceController],
  providers: [EmployeesService, AttendanceService],
  exports: [EmployeesService],
})
export class HrModule {}
