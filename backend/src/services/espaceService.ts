import { prisma } from '../config/database';

export interface CreateEspaceData {
  name: string;
  createdBy: string;
}

export class EspaceService {
  static async createEspace(data: CreateEspaceData) {
    return await prisma.espaceTravail.create({
      data: {
        name: data.name
      },
      include: {
        bureaux: {
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
                users: true
              }
            }
          }
        }
      }
    });
  }

  static async getEspaceById(espaceId: string) {
    return await prisma.espaceTravail.findUnique({
      where: { id: espaceId },
      include: {
        bureaux: {
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
          }
        }
      }
    });
  }

  static async getAllEspaces() {
    return await prisma.espaceTravail.findMany({
      include: {
        bureaux: {
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
                users: true
              }
            }
          }
        },
        _count: {
          select: {
            bureaux: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async updateEspace(espaceId: string, name: string) {
    return await prisma.espaceTravail.update({
      where: { id: espaceId },
      data: { name },
      include: {
        bureaux: {
          include: {
            users: {
              select: {
                id: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
  }

  static async deleteEspace(espaceId: string) {
    // Vérifier s'il reste des bureaux
    const bureauxCount = await prisma.bureau.count({
      where: { espaceTravailId: espaceId }
    });

    if (bureauxCount > 0) {
      throw new Error('Impossible de supprimer un espace contenant des bureaux');
    }

    return await prisma.espaceTravail.delete({
      where: { id: espaceId }
    });
  }
}