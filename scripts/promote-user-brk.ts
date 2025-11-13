import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targetEmail = 'leonardojuvencio@brkambiental.com.br';
const newRole = 'USER'; // USER = aprovado, pode criar inspeções

async function main() {
  console.log(`\n🔄 Promovendo usuário: ${targetEmail}\n`);

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    console.log('❌ Usuário não encontrado!');
    return;
  }

  console.log(`Role atual: ${user.role}`);
  console.log(`Nova role: ${newRole}\n`);

  const updated = await prisma.user.update({
    where: { email: targetEmail },
    data: {
      role: newRole,
      approvedBy: 'ADMIN',
      approvedAt: new Date(),
    },
  });

  console.log('✅ Usuário promovido com sucesso!');
  console.log(`Email: ${updated.email}`);
  console.log(`Nome: ${updated.name}`);
  console.log(`Role: ${updated.role}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
