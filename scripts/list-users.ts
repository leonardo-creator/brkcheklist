import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  console.log('📋 Listando todos os usuários...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      approvedBy: true,
      approvedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (users.length === 0) {
    console.log('❌ Nenhum usuário encontrado no banco!');
    return;
  }

  console.log(`✅ ${users.length} usuário(s) encontrado(s):\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || 'Sem nome'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Aprovado por: ${user.approvedBy || 'N/A'}`);
    console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}`);
    console.log('');
  });
}

listUsers()
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
