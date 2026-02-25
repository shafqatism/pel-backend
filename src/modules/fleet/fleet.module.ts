import { Module } from '@nestjs/common';
import { VehiclesService } from './services/vehicles.service';
import { TripsService } from './services/trips.service';
import { FuelService } from './services/fuel.service';
import { MaintenanceService } from './services/maintenance.service';
import { AssignmentsService } from './services/assignments.service';
import { FleetReportsService } from './services/fleet-reports.service';
import { VehiclesController } from './controllers/vehicles.controller';
import { TripsController } from './controllers/trips.controller';
import { FuelController } from './controllers/fuel.controller';
import { MaintenanceController } from './controllers/maintenance.controller';
import { AssignmentsController } from './controllers/assignments.controller';
import { FleetReportsController } from './controllers/fleet-reports.controller';

@Module({
  controllers: [
    VehiclesController,
    TripsController,
    FuelController,
    MaintenanceController,
    AssignmentsController,
    FleetReportsController,
  ],
  providers: [
    VehiclesService,
    TripsService,
    FuelService,
    MaintenanceService,
    AssignmentsService,
    FleetReportsService,
  ],
  exports: [VehiclesService],
})
export class FleetModule {}
