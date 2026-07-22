import { Request } from 'express';
import { Notification } from '../../models';
import { NotificationService } from '../../services/notification.service';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

const getUserId = (context: Context) => {
  const authUser = (context.req as any).user;

  if (!authUser?.id) {
    throw new Error('Unauthorized: Invalid or missing token.');
  }

  return Number(authUser.id);
};

export const notifications = async (_: any, args: { filter?: string }, context: Context) => {
  try {
    const userId = getUserId(context);
    const isUnreadOnly = String(args.filter || '').toLowerCase() === 'unread';

    const rows = await Notification.findAll({
      where: {
        user_id: userId,
        ...(isUnreadOnly ? { is_read: false } : {}),
      },
      order: [['created_at', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return {
      notifications: rows.map((item) => ({
        ...item.toJSON(),
        data: item.data ? JSON.stringify(item.data) : null,
      })),
      unread_count: unreadCount,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in notifications: ${error}`);
    throw new Error(error);
  }
};

export const markNotificationRead = async (
  _: any,
  args: { notification_id: number },
  context: Context,
) => {
  try {
    const userId = getUserId(context);

    const notification = await Notification.findOne({
      where: {
        id: args.notification_id,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found.');
    }

    notification.is_read = true;
    await notification.save();

    return {
      success: true,
      notification_id: notification.id,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in markNotificationRead: ${error}`);
    throw new Error(error);
  }
};

export const registerPushToken = async (
  _: any,
  args: { token: string; platform: string },
  context: Context,
) => {
  try {
    const userId = getUserId(context);

    await NotificationService.getInstance().registerDeviceToken(
      userId,
      args.token.trim(),
      args.platform.trim(),
    );

    return {
      success: true,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in registerPushToken: ${error}`);
    throw new Error(error);
  }
};

export const unregisterPushToken = async (
  _: any,
  args: { token: string },
  context: Context,
) => {
  try {
    const userId = getUserId(context);

    await NotificationService.getInstance().unregisterDeviceToken(
      userId,
      args.token.trim(),
    );

    return {
      success: true,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in unregisterPushToken: ${error}`);
    throw new Error(error);
  }
};
