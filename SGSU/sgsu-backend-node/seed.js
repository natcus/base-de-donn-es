const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sgsu.edu';
  const exists = await prisma.user.findUnique({ where: { email } });
  
  if (!exists) {
    await prisma.user.create({
      data: {
        nom: 'Administrateur SGSU',
        email: email,
        password: 'admin@123',
        role: 'admin'
      }
    });
    console.log('✅ Compte admin par défaut créé avec succès !');
  } else {
    // Mettre à jour le mot de passe s'il a changé
    await prisma.user.update({
      where: { email },
      data: { password: 'admin@123' }
    });
    console.log('✅ Compte admin existant mis à jour avec le mot de passe par défaut !');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
