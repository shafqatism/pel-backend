const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for vehicles...');
  
  // Get the first vehicle
  const vehicle = await prisma.vehicle.findFirst();
  
  if (!vehicle) {
    console.log('❌ No vehicles found. Please create a vehicle first.');
    return;
  }
  
  console.log(`✅ Found vehicle: ${vehicle.registrationNumber} - ${vehicle.vehicleName}`);
  
  // Create a test fuel log
  console.log('📝 Creating test fuel log...');
  
  const fuelLog = await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle.id,
      date: new Date(),
      quantityLiters: 50.5,
      ratePerLiter: 310,
      totalCost: 15655,
      odometerReading: 12500,
      stationName: 'PSO Test Station',
      paymentMethod: 'cash',
    },
  });
  
  console.log('✅ Fuel log created successfully!');
  console.log(`   ID: ${fuelLog.id}`);
  console.log(`   Vehicle: ${vehicle.registrationNumber}`);
  console.log(`   Quantity: ${fuelLog.quantityLiters} L`);
  console.log(`   Total Cost: PKR ${fuelLog.totalCost}`);
  
  // List all fuel logs
  const allFuelLogs = await prisma.fuelLog.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  console.log(`\n📊 Total fuel logs in database: ${allFuelLogs.length}`);
  allFuelLogs.forEach((log, i) => {
    console.log(`   ${i + 1}. ${log.vehicle.registrationNumber} - ${log.quantityLiters}L - PKR ${log.totalCost} (ID: ${log.id})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
