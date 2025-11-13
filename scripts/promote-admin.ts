import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'leonardojuvencio018@gmail.com';

  console.log(`🔍 Procurando usuário: ${adminEmail}`);

  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!user) {
    console.log('❌ Usuário não encontrado!');
    return;
  }

  console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
  console.log(`📊 Role atual: ${user.role}`);

  if (user.role === 'ADMIN') {
    console.log('✅ Usuário já é ADMIN!');
    return;
  }

  console.log('🚀 Promovendo para ADMIN...');

  await prisma.user.update({
    where: { email: adminEmail },
    data: {
      role: 'ADMIN',
      approvedBy: 'SYSTEM',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Usuário promovido para ADMIN com sucesso!');
}

promoteToAdmin()
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
