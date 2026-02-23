const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = 'postgresql://neondb_owner:npg_Fc3fGyPk8XQZ@ep-weathered-mode-ai1ubbr4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function seed() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database for seeding...');

    // --- Cleanup ---
    console.log('Cleaning up old records...');
    await client.query('DELETE FROM trips');
    await client.query('DELETE FROM fuel_logs');
    await client.query('DELETE FROM hse_incidents');
    await client.query('DELETE FROM hse_audits');
    await client.query('DELETE FROM hse_drills');
    await client.query('DELETE FROM food_mess');
    await client.query('DELETE FROM expenses');
    await client.query('DELETE FROM employees');
    await client.query('DELETE FROM project_sites');
    await client.query('DELETE FROM vehicles');

    // 1. Seed Sites
    console.log('Seeding Sites...');
    const sites = [
      ['Site Alpha (Gas Field)', 'Badin District', 'Badin', 'Sindh', '24.63, 68.83', 'drilling', 'Drilling phase started Feb 2026'],
      ['Site Beta (Oil Unit)', 'Pindi Gheb', 'Attock', 'Punjab', '33.40, 72.27', 'production', 'Active production site'],
      ['PEL HQ Islamabad', 'Blue Area', 'Islamabad', 'ICT', '33.72, 73.06', 'exploration', 'Central Management Office']
    ];
    const siteIds = [];
    for (const s of sites) {
      const res = await client.query(
        'INSERT INTO project_sites (id, "siteName", location, district, province, coordinates, phase, description, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id, "siteName"',
        s
      );
      siteIds.push({ id: res.rows[0].id, name: res.rows[0].siteName });
    }

    // 2. Seed Vehicles
    console.log('Seeding Vehicles...');
    const vehiclesData = [
      ['LEA-8842', 'Toyota Hilux 4x4', 'Toyota', 'Hilux', 2023, 'White', 'suv', 'diesel', 'company_owned', 'active', 'Site Alpha (Gas Field)', 12500],
      ['IDL-2031', 'Toyota Prado', 'Toyota', 'Prado', 2022, 'Black', 'suv', 'diesel', 'company_owned', 'active', 'PEL HQ Islamabad', 45000],
      ['BWP-900', 'Hino FM Truck', 'Hino', 'FM8J', 2021, 'Blue', 'truck', 'diesel', 'leased', 'active', 'Site Beta (Oil Unit)', 89000],
      ['GA-552', 'Mitsubishi L200', 'Mitsubishi', 'L200', 2024, 'Silver', 'pickup', 'diesel', 'rented', 'in_maintenance', 'Site Alpha (Gas Field)', 5600]
    ];
    const vehicleIds = [];
    for (const v of vehiclesData) {
      const res = await client.query(
        'INSERT INTO vehicles (id, "registrationNumber", "vehicleName", make, model, year, color, type, "fuelType", "ownershipStatus", status, "assignedSite", "currentOdometerKm", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING id, "registrationNumber"',
        v
      );
      vehicleIds.push({ id: res.rows[0].id, reg: res.rows[0].registrationNumber });
    }

    // 3. Seed Trips (Related to Vehicles)
    console.log('Seeding Trips...');
    const trips = [
      [vehicleIds[0].id, 'Badin Field Office', 'Crew movement for shift change', '2026-02-21', 12400, 12500, 100, 'Zubair Hussain', 'completed'],
      [vehicleIds[1].id, 'Islamabad Airport', 'Executive pickup', '2026-02-22', 44800, 44950, 150, 'Ahmed Ali', 'completed'],
      [vehicleIds[2].id, 'Site Beta Store', 'Heavy machinery transport', '2026-02-20', 88900, 89100, 200, 'Khan Baba', 'completed']
    ];
    for (const t of trips) {
      await client.query(
        'INSERT INTO trips (id, "vehicleId", destination, "purposeOfVisit", "tripDate", "meterOut", "meterIn", "totalKm", "driverName", status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
        t
      );
    }

    // 4. Seed Employees
    console.log('Seeding Employees...');
    const emps = [
      ['Ahmed Khan', 'Field Engineer', 'Operations', 'active', 120000],
      ['Sajid Mehmood', 'Rig Supervisor', 'Drilling', 'active', 180000],
      ['Fatima Ali', 'HR Administrator', 'HR', 'active', 85000],
      ['Zubair Hussain', 'Senior Driver', 'Logistics', 'active', 45000]
    ];
    for (const e of emps) {
      await client.query(
        'INSERT INTO employees (id, "fullName", designation, department, status, "basicSalary", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())',
        e
      );
    }

    // 5. Seed Expenses
    console.log('Seeding Financial Expenses...');
    const expenses = [
      ['Site Alpha Fuel Refill', '1000L Diesel for Generator', 'Fuel', 280000.00, '2026-02-15', 'approved', 'Site Alpha (Gas Field)', 'Operations'],
      ['Pindi Gheb Land Lease', 'Quarterly rental for Beta Sector', 'Rent', 750000.00, '2026-01-01', 'approved', 'Site Beta (Oil Unit)', 'Finance'],
      ['Rig Tooling Repair', 'Precision bits restoration', 'Maintenance', 45000.00, '2026-02-10', 'pending', 'Site Alpha (Gas Field)', 'Mechanical'],
      ['Mess Supplies - Feb', 'Provisions for HQ Kitchen', 'Food', 32000.00, '2026-02-18', 'approved', 'PEL HQ Islamabad', 'HR']
    ];
    for (const x of expenses) {
      await client.query(
        'INSERT INTO expenses (id, title, description, category, amount, "dateIncurred", status, site, department, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())',
        x
      );
    }

    // 6. Seed HSE
    console.log('Seeding HSE Data...');
    const incidents = [
      ['Minor Spill at Drilling Floor', 'Leakage from hydraulic hose during active drilling', '2026-02-12', 'Site Alpha Drilling Rig', 'low', 'Ahmed Khan', 'closed'],
      ['Safety Near Miss - Crane Operation', 'Crane boom passed too close to overhead cables', '2026-02-19', 'Material Yard Beta', 'high', 'Sajid Mehmood', 'investigating']
    ];
    for (const i of incidents) {
      await client.query(
        'INSERT INTO hse_incidents (id, title, description, "incidentDate", location, severity, "reportedBy", status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
        i
      );
    }

    const audits = [
      ['Monthly Safety Inspection', '2026-02-17', 'Zahid Qureshi', 'Site Alpha (Gas Field)', 88, 'compliant'],
      ['PPE Compliance Check', '2026-02-14', 'Usman Gilani', 'PEL HQ Islamabad', 95, 'compliant']
    ];
    for (const a of audits) {
      await client.query(
        'INSERT INTO hse_audits (id, "auditTitle", "auditDate", "auditorName", site, score, findings, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())',
        a
      );
    }

    // 7. Seed Food Mess
    console.log('Seeding Food Mess Records...');
    const food = [
      ['2026-02-21', 'Lunch', 45, 'Chicken Biryani, Raita', 280, 12600, 'Site Alpha (Gas Field)'],
      ['2026-02-21', 'Dinner', 42, 'Daal Chawal, Kheer', 150, 6300, 'Site Alpha (Gas Field)'],
      ['2026-02-21', 'Lunch', 28, 'Mutton Karahi, Naan', 350, 9800, 'Site Beta (Oil Unit)']
    ];
    for (const f of food) {
       await client.query(
         'INSERT INTO food_mess (id, date, "mealType", "headCount", "menuItems", "costPerHead", "totalCost", site, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())',
         f
       );
    }

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');

  } catch (err) {
    console.error('\n!!! SEEDING ERROR !!!');
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
