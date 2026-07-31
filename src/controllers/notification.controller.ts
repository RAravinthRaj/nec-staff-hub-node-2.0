/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getNotifications(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.userId || authUser?.id || 1;
      const filter = (req.query.filter as string) || undefined;

      const data = await NotificationService.getUserNotifications(userId, filter);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to fetch notifications' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.userId || authUser?.id || 1;
      const notificationId = Number(req.params.id);

      const result = await NotificationService.markAsRead(notificationId, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to mark notification as read' });
    }
  }

  static async triggerCronTest(req: Request, res: Response) {
    try {
      await NotificationService.runDaily5PMCronCheck();
      return res.status(200).json({ message: 'Cron job executed successfully' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Cron execution failed' });
    }
  }
}
