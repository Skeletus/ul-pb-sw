import { PrismaClient, MachineStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Demo123456', 10);

  await prisma.user.upsert({
    where: { email: 'demo@workmeter.com' },
    update: {
      name: 'Demo Supervisor',
      passwordHash,
      status: 'ACTIVE',
    },
    create: {
      name: 'Demo Supervisor',
      email: 'demo@workmeter.com',
      passwordHash,
      status: 'ACTIVE',
    },
  });

  const site = await prisma.site.upsert({
    where: { id: 1 },
    update: {
      name: 'Obra Residencial Los Olivos',
      location: 'Lima',
    },
    create: {
      name: 'Obra Residencial Los Olivos',
      location: 'Lima',
    },
  });

  const machines = await Promise.all([
    prisma.machine.upsert({
      where: { code: 'MACH-001' },
      update: {
        siteId: site.id,
        type: 'Excavadora',
        hourlyRate: 120,
      },
      create: {
        siteId: site.id,
        code: 'MACH-001',
        type: 'Excavadora',
        hourlyRate: 120,
      },
    }),
    prisma.machine.upsert({
      where: { code: 'MACH-002' },
      update: {
        siteId: site.id,
        type: 'Retroexcavadora',
        hourlyRate: 95,
      },
      create: {
        siteId: site.id,
        code: 'MACH-002',
        type: 'Retroexcavadora',
        hourlyRate: 95,
      },
    }),
    prisma.machine.upsert({
      where: { code: 'MACH-003' },
      update: {
        siteId: site.id,
        type: 'Grua Torre',
        hourlyRate: 180,
      },
      create: {
        siteId: site.id,
        code: 'MACH-003',
        type: 'Grua Torre',
        hourlyRate: 180,
      },
    }),
  ]);

  const today = new Date();
  const dayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 8, 0, 0));
  const activeEnd = new Date(dayStart.getTime() + 2 * 60 * 60 * 1000);
  const inactiveEnd = new Date(activeEnd.getTime() + 45 * 60 * 1000);

  await prisma.machineStateRecord.deleteMany({ where: { machineId: machines[0].id } });
  await prisma.sensorReading.deleteMany({ where: { machineId: machines[0].id } });

  await prisma.machineStateRecord.createMany({
    data: [
      {
        machineId: machines[0].id,
        status: MachineStatus.ACTIVE,
        startDate: dayStart,
        endDate: activeEnd,
      },
      {
        machineId: machines[0].id,
        status: MachineStatus.INACTIVE,
        startDate: activeEnd,
        endDate: inactiveEnd,
      },
    ],
  });

  await prisma.machine.update({
    where: { id: machines[0].id },
    data: { currentStatus: MachineStatus.INACTIVE },
  });

  await prisma.sensorReading.createMany({
    data: [
      {
        machineId: machines[0].id,
        timestamp: dayStart,
        vibration: 0.8,
        energyConsumption: 12,
      },
      {
        machineId: machines[0].id,
        timestamp: activeEnd,
        vibration: 0.1,
        energyConsumption: 2,
      },
      {
        machineId: machines[0].id,
        timestamp: inactiveEnd,
        vibration: 0.1,
        energyConsumption: 2,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
