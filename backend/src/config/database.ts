import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('📊 Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};