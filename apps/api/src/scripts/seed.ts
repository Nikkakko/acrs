import { prisma } from '../db/prisma.js';

async function main() {
  const staff = [
    { firstName: 'Giorgi', lastName: 'Giorgadze', photoUrl: 'https://picsum.photos/seed/giorgi/100' },
    { firstName: 'Nino', lastName: 'Beridze', photoUrl: 'https://picsum.photos/seed/nino/100' },
    { firstName: 'Ana', lastName: 'Kapanadze', photoUrl: 'https://picsum.photos/seed/ana/100' }
  ];

  for (const row of staff) {
    const existing = await prisma.staff.findFirst({
      where: { firstName: row.firstName, lastName: row.lastName }
    });
    if (!existing) await prisma.staff.create({ data: row });
  }

  const services = [
    { name: 'Facial Cleaning', price: 80, color: '#53B3CB' },
    { name: 'Laser Hair Removal', price: 120, color: '#F08A5D' },
    { name: 'Eyebrow Styling', price: 35, color: '#6A994E' }
  ];

  for (const row of services) {
    const existing = await prisma.service.findFirst({ where: { name: row.name } });
    if (!existing) await prisma.service.create({ data: row });
  }

  console.log('Seed complete');
}

main()
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
