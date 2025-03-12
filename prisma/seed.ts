const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Verificar se já existe um usuário admin
  const adminExists = await prisma.user.findFirst({
    where: {
      role: Role.ADMIN
    }
  });

  if (!adminExists) {
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@exemplo.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });
    
    console.log('Usuário administrador criado com sucesso!');
  } else {
    console.log('Usuário administrador já existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 