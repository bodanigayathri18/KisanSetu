import { Notification, NotificationType } from '../../src/shared/types';
import { db } from '../repositories/db';

export class NotificationService {
  /**
   * Centralized notification dispatcher.
   * Dispatches in-app notifications and leaves clean extension points for future SMS / WhatsApp integrations.
   */
  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      metadata,
    };

    const saved = db.addNotification(notification);

    // Extension point: In future iterations, integrate SMS/WhatsApp gateways here:
    // if (user.phone && process.env.ENABLE_SMS_GATEWAY === 'true') {
    //   await sendSms(user.phone, `${title}: ${message}`);
    // }

    return saved;
  }

  async broadcastToCentreFarmers(
    centreId: string,
    title: string,
    message: string,
    type: NotificationType = 'CENTRE_ALERT'
  ): Promise<number> {
    // Find all farmers with active tokens in this centre
    const tokens = db.getTokens({ centreId });
    const activeFarmerIds = Array.from(
      new Set(
        tokens
          .filter((t) => ['WAITING', 'CALLED', 'ARRIVED', 'PROCESSING'].includes(t.status))
          .map((t) => t.farmerId)
      )
    );

    for (const farmerId of activeFarmerIds) {
      await this.sendNotification(farmerId, title, message, type, { centreId });
    }

    return activeFarmerIds.length;
  }
}

export const notificationService = new NotificationService();
