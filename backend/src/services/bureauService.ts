import { prisma } from '../config/database';

export interface CreateBureauData {
  name: string;
  color: string;
  country: string;
  espaceTravailId: string;
}

export interface UpdateBureauData {
  name?: string;
  color?: string;
  country?: string;
}

export class BureauService {
  static async createBureau(data: CreateBureauData) {
    // Vérifier la limite de 6 bureaux par espace
    const existingBureaux = await prisma.bureau.count({
      where: { espaceTravailId: data.espaceTravailId }
    });

    if (existingBureaux >= 6) {
      throw new Error('Maximum 6 bureaux autorisés par espace de travail');
    }

    return await prisma.bureau.create({
      data: {
        name: data.name,
        color: data.color,
        country: data.country,
        espaceTravailId: data.espaceTravailId
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  static async getBureauById(bureauId: string) {
    return await prisma.bureau.findUnique({
      where: { id: bureauId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        espaceTravail: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  static async getBureauxByEspace(espaceTravailId: string) {
    return await prisma.bureau.findMany({
      where: { espaceTravailId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            users: true,
            messages: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async updateBureau(bureauId: string, data: UpdateBureauData) {
    return await prisma.bureau.update({
      where: { id: bureauId },
      data,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  static async deleteBureau(bureauId: string) {
    // Vérifier s'il reste des utilisateurs dans le bureau
    const usersCount = await prisma.user.count({
      where: { bureauId }
    });

    if (usersCount > 0) {
      throw new Error('Impossible de supprimer un bureau contenant des utilisateurs');
    }

    return await prisma.bureau.delete({
      where: { id: bureauId }
    });
  }

  static async updateBureauColor(bureauId: string, color: string) {
    const allowedColors = [
      '#10b981', // vert
      '#3b82f6', // bleu
      '#ef4444', // rouge
      '#8b5cf6', // violet
      '#f59e0b', // orange
      '#eab308', // jaune
      '#6366f1', // indigo
      '#000000'  // noir
    ];

    if (!allowedColors.includes(color)) {
      throw new Error('Couleur non autorisée');
    }

    return await this.updateBureau(bureauId, { color });
  }
}