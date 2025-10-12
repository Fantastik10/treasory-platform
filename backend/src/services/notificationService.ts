import { prisma } from '../config/database';

export class NotificationService {
  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        include: {
          bureau: {
            select: {
              id: true,
              name: true,
              color: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({
        where: { userId }
      })
    ]);

    return {
      notifications,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId
      }
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }

  static async createNotification(data: {
    type: string;
    title: string;
    content?: string;
    userId: string;
    bureauId?: string;
  }) {
    return await prisma.notification.create({
      data,
      include: {
        bureau: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
  }

  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }
}