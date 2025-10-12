import { prisma } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

async function main() {
  console.log('🌱 Starting database seed...');

  // Créer un espace de travail par défaut
  const espaceTravail = await prisma.espaceTravail.create({
    data: {
      name: 'Espace Principal'
    }
  });

  // Créer un bureau par défaut
  const bureau = await prisma.bureau.create({
    data: {
      name: 'Bureau France',
      color: '#3b82f6',
      country: 'FR',
      espaceTravailId: espaceTravail.id
    }
  });

  // Créer un admin principal
  const adminPassword = await hashPassword('admin123');
  await prisma.user.create({
    data: {
      email: 'admin@treasory.com',
      password: adminPassword,
      role: 'ADMIN_1',
      bureauId: bureau.id
    }
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });