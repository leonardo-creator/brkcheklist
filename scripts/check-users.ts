import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Verificando usuários...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      approvedBy: true,
      approvedAt: true,
    },
  });

  console.log('📋 Usuários encontrados:\n');
  users.forEach((user) => {
    console.log(`---`);
    console.log(`Email: ${user.email}`);
    console.log(`Nome: ${user.name || 'N/A'}`);
    console.log(`Role: ${user.role}`);
    console.log(`Aprovado: ${user.approvedBy ? 'Sim' : 'Não'}`);
    if (user.approvedAt) {
      console.log(`Data aprovação: ${user.approvedAt.toLocaleString('pt-BR')}`);
    }
    console.log('');
  });

  console.log(`\n✅ Total: ${users.length} usuários\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
