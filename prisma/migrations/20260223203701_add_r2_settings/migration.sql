-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Petroleum Exploration Limited',
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "unitSystem" TEXT NOT NULL DEFAULT 'metric',
    "maintenanceIntervalKm" INTEGER NOT NULL DEFAULT 5000,
    "systemEmail" TEXT NOT NULL DEFAULT 'admin@pelexploration.com.pk',
    "brandingColors" JSONB,
    "enableNotifications" BOOLEAN NOT NULL DEFAULT true,
    "r2AccountId" TEXT,
    "r2AccessKeyId" TEXT,
    "r2SecretAccessKey" TEXT,
    "r2BucketName" TEXT,
    "r2PublicCustomDomain" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "chassisNumber" TEXT,
    "engineNumber" TEXT,
    "type" TEXT NOT NULL DEFAULT 'sedan',
    "fuelType" TEXT NOT NULL DEFAULT 'petrol',
    "ownershipStatus" TEXT NOT NULL DEFAULT 'company_owned',
    "status" TEXT NOT NULL DEFAULT 'active',
    "assignedSite" TEXT,
    "assignedDepartment" TEXT,
    "currentDriverName" TEXT,
    "currentOdometerKm" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maintenanceIntervalKm" INTEGER NOT NULL DEFAULT 5000,
    "maintenanceIntervalDays" INTEGER NOT NULL DEFAULT 180,
    "insuranceExpiry" DATE,
    "registrationExpiry" DATE,
    "fitnessExpiry" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "purposeOfVisit" TEXT,
    "tripDate" DATE NOT NULL,
    "meterOut" DECIMAL(12,2) NOT NULL,
    "meterIn" DECIMAL(12,2),
    "totalKm" DECIMAL(12,2),
    "timeOut" TIMESTAMP,
    "timeIn" TIMESTAMP,
    "driverName" TEXT,
    "personTravelList" TEXT[],
    "fuelAllottedLiters" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fuelCostPkr" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "quantityLiters" DECIMAL(10,2) NOT NULL,
    "ratePerLiter" DECIMAL(10,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "odometerReading" DECIMAL(12,2) NOT NULL,
    "stationName" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'routine_check',
    "description" TEXT,
    "maintenanceDate" DATE NOT NULL,
    "costPkr" DECIMAL(12,2) NOT NULL,
    "shopOrPerson" TEXT,
    "odometerAtMaintenanceKm" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nextServiceOdometerKm" DECIMAL(12,2),
    "nextServiceDueDate" DATE,
    "maintenanceBy" TEXT NOT NULL DEFAULT 'internal',
    "documentUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_assignments" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignmentDate" DATE NOT NULL,
    "returnDate" DATE,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "fatherName" TEXT,
    "cnic" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "designation" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "joiningDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "basicSalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "profilePhotoUrl" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP,
    "checkOut" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'present',
    "notes" TEXT,
    "site" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "dateIncurred" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "remarks" TEXT,
    "receiptUrl" TEXT,
    "site" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hse_incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentDate" DATE NOT NULL,
    "location" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "reportedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "correctiveAction" TEXT,
    "site" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hse_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hse_audits" (
    "id" TEXT NOT NULL,
    "auditTitle" TEXT NOT NULL,
    "auditDate" DATE NOT NULL,
    "auditorName" TEXT NOT NULL,
    "site" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "observations" TEXT,
    "findings" TEXT NOT NULL DEFAULT 'compliant',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hse_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hse_drills" (
    "id" TEXT NOT NULL,
    "drillType" TEXT NOT NULL,
    "drillDate" DATE NOT NULL,
    "location" TEXT NOT NULL,
    "participantsCount" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER,
    "outcome" TEXT,
    "supervisor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hse_drills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_sites" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "location" TEXT,
    "district" TEXT,
    "province" TEXT,
    "coordinates" TEXT,
    "phase" TEXT NOT NULL DEFAULT 'exploration',
    "status" TEXT NOT NULL DEFAULT 'active',
    "siteInCharge" TEXT,
    "contactPhone" TEXT,
    "startDate" DATE,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "uploadedBy" TEXT,
    "department" TEXT,
    "site" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_mess" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" TEXT NOT NULL,
    "headCount" INTEGER NOT NULL DEFAULT 0,
    "menuItems" TEXT,
    "costPerHead" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "site" TEXT,
    "rating" DECIMAL(3,2),
    "remarks" TEXT,
    "preparedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_mess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "land_rentals" (
    "id" TEXT NOT NULL,
    "landOwnerName" TEXT NOT NULL,
    "landOwnerCnic" TEXT,
    "landOwnerPhone" TEXT,
    "location" TEXT NOT NULL,
    "district" TEXT,
    "province" TEXT,
    "areaAcres" DECIMAL(10,2),
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "leaseStartDate" DATE NOT NULL,
    "leaseEndDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'active',
    "purpose" TEXT,
    "agreementDocUrl" TEXT,
    "site" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "land_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registrationNumber_key" ON "vehicles"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_cnic_key" ON "employees"("cnic");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
