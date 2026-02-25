import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Starting Database Seeding...');

    // 1. Seed Admin User (Idempotent)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await this.prisma.user.upsert({
      where: { email: 'admin@pelexploration.com.pk' },
      update: {},
      create: {
        email: 'admin@pelexploration.com.pk',
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'admin',
      },
    });
    this.logger.log('Admin user ensured');

    // 2. Seed Project Sites (Conditional)
    const siteCount = await this.prisma.projectSite.count();
    let sites = [];
    if (siteCount === 0) {
      sites = await Promise.all([
        this.prisma.projectSite.create({ data: { siteName: 'Site Alpha - Kirthar', location: 'Sindh', phase: 'exploration', status: 'active' } }),
        this.prisma.projectSite.create({ data: { siteName: 'Site Beta - Potohar', location: 'Punjab', phase: 'drilling', status: 'active' } }),
      ]);
      this.logger.log('Project sites seeded');
    }

    // 3. Seed Employees (Conditional)
    const empCount = await this.prisma.employee.count();
    let emp1;
    if (empCount === 0) {
      emp1 = await this.prisma.employee.create({
        data: {
          fullName: 'Ahmed Khan',
          designation: 'Field Engineer',
          department: 'Operations',
          status: 'active',
          basicSalary: 85000,
        }
      });
      await this.prisma.employee.create({
        data: {
          fullName: 'Sara Ali',
          designation: 'HSE Officer',
          department: 'Safety',
          status: 'active',
          basicSalary: 75000,
        }
      });
      this.logger.log('Employees seeded');
    }

    // 4. Seed Vehicles (Conditional)
    const vehicleCount = await this.prisma.vehicle.count();
    let v1;
    if (vehicleCount === 0) {
      v1 = await this.prisma.vehicle.create({
        data: {
          registrationNumber: 'ABC-123',
          vehicleName: 'Toyota Hilux 4x4',
          make: 'Toyota',
          model: 'Hilux',
          year: 2022,
          type: 'truck',
          fuelType: 'diesel',
          status: 'active',
          assignedSite: 'Site Alpha - Kirthar',
          currentOdometerKm: 15000,
        }
      });
      this.logger.log('Vehicles seeded');
    }

    // 5. Seed Dropdown Options (Idempotent Upsert)
    const dropdownOptions = [
      // Fleet Defaults
      { category: 'maintenance_type', label: 'Oil Change', value: 'oil_change' },
      { category: 'maintenance_type', label: 'Tire Rotation', value: 'tire_rotation' },
      { category: 'maintenance_type', label: 'Brake Service', value: 'brake_service' },
      { category: 'maintenance_type', label: 'Engine Tune-up', value: 'engine_tuneup' },
      { category: 'maintenance_vendor', label: 'Internal Workshop', value: 'internal' },
      { category: 'maintenance_vendor', label: 'Toyota Authorized Service', value: 'toyota_service' },
      { category: 'payment_method', label: 'Cash', value: 'cash' },
      { category: 'payment_method', label: 'Fuel Card', value: 'fuel_card' },
      { category: 'payment_method', label: 'Credit Account', value: 'credit' },
      { category: 'vehicle_type', label: 'SUV', value: 'suv' },
      { category: 'vehicle_type', label: 'Pickup 4x4', value: 'pickup' },
      { category: 'vehicle_type', label: 'Sedan', value: 'sedan' },
      { category: 'vehicle_type', label: 'Truck', value: 'truck' },
      { category: 'fuel_type', label: 'Petrol', value: 'petrol' },
      { category: 'fuel_type', label: 'Diesel', value: 'diesel' },
      { category: 'vehicle_ownership', label: 'Company Owned', value: 'company_owned' },
      { category: 'vehicle_ownership', label: 'Leased', value: 'leased' },
      { category: 'vehicle_status', label: 'Active', value: 'active' },
      { category: 'vehicle_status', label: 'In Maintenance', value: 'in_maintenance' },
      { category: 'trip_status', label: 'Active', value: 'active' },
      { category: 'trip_status', label: 'Completed', value: 'completed' },
      
      // HSE Defaults
      { category: 'incident_severity', label: 'Low', value: 'low' },
      { category: 'incident_severity', label: 'Medium', value: 'medium' },
      { category: 'incident_severity', label: 'High', value: 'high' },
      { category: 'incident_severity', label: 'Critical', value: 'critical' },
      { category: 'audit_finding', label: 'Compliant', value: 'compliant' },
      { category: 'audit_finding', label: 'Minor Non-Conformance', value: 'minor_nc' },
      { category: 'audit_finding', label: 'Major Non-Conformance', value: 'major_nc' },
      { category: 'hse_drill_type', label: 'Fire Drill', value: 'fire_drill' },
      { category: 'hse_drill_type', label: 'Oil Spill Response', value: 'spill_response' },
      { category: 'hse_drill_type', label: 'Emergency Evacuation', value: 'evacuation' },

      // HR Defaults
      { category: 'hr_department', label: 'Operations', value: 'operations' },
      { category: 'hr_department', label: 'Finance', value: 'finance' },
      { category: 'hr_department', label: 'HSE', value: 'hse' },
      { category: 'hr_department', label: 'Human Resources', value: 'hr' },
      { category: 'hr_designation', label: 'Project Manager', value: 'project_manager' },
      { category: 'hr_designation', label: 'HSE Officer', value: 'hse_officer' },
      { category: 'hr_designation', label: 'Field Engineer', value: 'field_engineer' },
      { category: 'hr_designation', label: 'Senior Geologist', value: 'senior_geologist' },

      // Site Defaults
      { category: 'site_phase', label: 'Exploration', value: 'exploration' },
      { category: 'site_phase', label: 'Drilling', value: 'drilling' },
      { category: 'site_phase', label: 'Production', value: 'production' },
      { category: 'site_status', label: 'Active', value: 'active' },
      { category: 'site_status', label: 'Inactive', value: 'inactive' },

      // Finance Defaults
      { category: 'expense_category', label: 'Fuel', value: 'fuel' },
      { category: 'expense_category', label: 'Maintenance', value: 'maintenance' },
      { category: 'expense_category', label: 'Utilities', value: 'utilities' },
      { category: 'expense_category', label: 'Site Supplies', value: 'supplies' },
      { category: 'expense_category', label: 'General Admin', value: 'general' },

      // Company Defaults
      { category: 'company_category', label: 'Vendor', value: 'vendor' },
      { category: 'company_category', label: 'Client', value: 'client' },
      { category: 'company_category', label: 'Partner', value: 'partner' },
      { category: 'company_status', label: 'Active', value: 'active' },
      { category: 'company_status', label: 'Inactive', value: 'inactive' },
    ];

    for (const opt of dropdownOptions) {
      await this.prisma.dropdownOption.upsert({
        where: { category_value: { category: opt.category, value: opt.value } },
        update: {},
        create: opt,
      });
    }
    this.logger.log('Dropdown options ensured');

    // 6. Seed Companies (Conditional)
    const companyCount = await this.prisma.company.count();
    if (companyCount === 0) {
      await this.prisma.company.createMany({
        data: [
          {
            name: 'Petroleum Logistics Services',
            registrationNumber: 'PLS-9922',
            taxId: 'NTN-882211-1',
            email: 'info@pls-logistics.com',
            phone: '+92 21 3456789',
            address: 'Plot 42, Harbour Road',
            city: 'Karachi',
            category: 'vendor',
            contactPerson: 'Zubair Ahmed',
            industry: 'Logistics',
          },
          {
            name: 'Safety First Equipments',
            registrationNumber: 'SFE-4411',
            taxId: 'NTN-773322-2',
            email: 'sales@safetyfirst.com.pk',
            phone: '+92 42 111222333',
            address: 'Industrial Estate Phase 2',
            city: 'Lahore',
            category: 'vendor',
            contactPerson: 'M. Ali',
            industry: 'Safety',
          },
          {
            name: 'Global Energy Partners',
            email: 'partners@gep.com',
            category: 'partner',
            city: 'Islamabad',
            contactPerson: 'Jennifer Scott',
            industry: 'Consulting',
          }
        ]
      });
      this.logger.log('Companies seeded');
    }

    this.logger.log('Database Seeding/Synchronization Completed!');
  }
}
