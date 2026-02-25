const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing Vehicle Assignments CRUD...\n');
  
  // Get a vehicle
  const vehicle = await prisma.vehicle.findFirst();
  if (!vehicle) {
    console.log('❌ No vehicles found');
    return;
  }
  
  console.log(`✅ Using vehicle: ${vehicle.registrationNumber}`);
  
  // CREATE
  console.log('\n📝 Testing CREATE...');
  const assignment = await prisma.vehicleAssignment.create({
    data: {
      vehicleId: vehicle.id,
      assignedTo: 'John Doe',
      assignedBy: 'Manager Smith',
      assignmentDate: new Date('2026-02-23'),
      returnDate: new Date('2026-03-23'),
      purpose: 'Field operations',
      status: 'active',
    },
  });
  console.log(`✅ Created assignment ID: ${assignment.id}`);
  
  // READ
  console.log('\n📖 Testing READ...');
  const found = await prisma.vehicleAssignment.findUnique({
    where: { id: assignment.id },
    include: { vehicle: true },
  });
  console.log(`✅ Found assignment: ${found.assignedTo} - ${found.vehicle.registrationNumber}`);
  
  // UPDATE
  console.log('\n✏️  Testing UPDATE...');
  const updated = await prisma.vehicleAssignment.update({
    where: { id: assignment.id },
    data: {
      returnDate: new Date('2026-04-23'),
      status: 'extended',
    },
  });
  console.log(`✅ Updated status to: ${updated.status}`);
  
  // LIST
  console.log('\n📋 Testing LIST...');
  const all = await prisma.vehicleAssignment.findMany({
    include: { vehicle: true },
    take: 5,
  });
  console.log(`✅ Found ${all.length} assignments`);
  all.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.vehicle.registrationNumber} → ${a.assignedTo} (${a.status})`);
  });
  
  // DELETE
  console.log('\n🗑️  Testing DELETE...');
  await prisma.vehicleAssignment.delete({
    where: { id: assignment.id },
  });
  console.log(`✅ Deleted assignment`);
  
  console.log('\n✅ All CRUD operations successful!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
