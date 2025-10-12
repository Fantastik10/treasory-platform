import { prisma } from '../config/database';

export class UserService {
  static async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        createdAt: true
      }
    });
  }

  static async updateUserBureau(userId: string, bureauId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { bureauId },
      select: {
        id: true,
        email: true,
        role: true,
        bureau: true
      }
    });
  }
}