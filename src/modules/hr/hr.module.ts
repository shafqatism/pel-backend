import { Module } from '@nestjs/common';
import { EmployeesService } from './services/employees.service';
import { AttendanceService } from './services/attendance.service';
import { EmployeesController } from './controllers/employees.controller';
import { AttendanceController } from './controllers/attendance.controller';

@Module({
  controllers: [EmployeesController, AttendanceController],
  providers: [EmployeesService, AttendanceService],
  exports: [EmployeesService],
})
export class HrModule {}
