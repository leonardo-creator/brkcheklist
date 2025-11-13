import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'leonardojuvencio018@gmail.com' },
    data: {
      role: 'ADMIN',
      approvedBy: 'SYSTEM',
      approvedAt: new Date(),
    },
  });

  console.log('✅ leonardojuvencio018@gmail.com promovido para ADMIN!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
