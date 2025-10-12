import { prisma } from '../config/database';

export interface CreateMessageData {
  content: string;
  authorId: string;
  bureauId: string;
}

export class MessageService {
  static async createMessage(data: CreateMessageData) {
    const message = await prisma.message.create({
      data: {
        content: data.content,
        authorId: data.authorId,
        bureauId: data.bureauId
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    // Créer des notifications pour tous les utilisateurs du bureau
    const bureauUsers = await prisma.user.findMany({
      where: { bureauId: data.bureauId },
      select: { id: true }
    });

    const notifications = bureauUsers
      .filter(user => user.id !== data.authorId) // Exclure l'auteur
      .map(user => ({
        type: 'MESSAGE',
        title: 'Nouveau message',
        content: `Nouveau message dans le bureau ${message.bureau.name}`,
        userId: user.id,
        bureauId: data.bureauId
      }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications
      });
    }

    return message;
  }

  static async getMessagesByBureau(bureauId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { bureauId },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({
        where: { bureauId }
      })
    ]);

    return {
      messages: messages.reverse(), // Plus ancien en premier
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  static async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    if (message.authorId !== userId) {
      throw new Error('Vous ne pouvez supprimer que vos propres messages');
    }

    return await prisma.message.delete({
      where: { id: messageId }
    });
  }
}