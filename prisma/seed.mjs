import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slots = [
  { time: "09:00", price: 120_000, capacity: 6 },
  { time: "11:30", price: 120_000, capacity: 6 },
  { time: "14:00", price: 135_000, capacity: 6 },
  { time: "17:00", price: 150_000, capacity: 6 },
];

try {
  for (const slot of slots) {
    await prisma.timeSlot.upsert({
      where: { time: slot.time },
      update: { ...slot, active: true },
      create: slot,
    });
  }

  console.log(`Seeded ${slots.length} Quad Sousse time slots.`);
} finally {
  await prisma.$disconnect();
}
