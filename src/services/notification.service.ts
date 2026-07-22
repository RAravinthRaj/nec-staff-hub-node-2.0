import { Op } from 'sequelize';
import { DeviceToken, Notification, Staff, Student, User } from '../models';
import logger from '../utils/logger';

interface CreateNotificationInput {
  userIds: number[];
  title: string;
  message: string;
  type: string;
  entityType?: string;
  entityId?: number;
  data?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }

    return NotificationService.instance;
  }

  async createNotifications(input: CreateNotificationInput) {
    const userIds = Array.from(new Set(input.userIds.filter(Boolean)));

    if (userIds.length === 0) {
      return [];
    }

    const rows = userIds.map((userId) => ({
      user_id: userId,
      title: input.title,
      message: input.message,
      type: input.type,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      data: input.data ?? null,
      is_read: false,
    }));

    const notifications = await Notification.bulkCreate(rows);
    await this.sendPushNotifications(userIds, input.title, input.message, input.data);
    return notifications;
  }

  async registerDeviceToken(userId: number, token: string, platform: string) {
    const existing = await DeviceToken.findOne({
      where: {
        [Op.or]: [{ token }, { user_id: userId, platform }],
      },
    });

    if (existing) {
      existing.user_id = userId;
      existing.token = token;
      existing.platform = platform;
      existing.is_active = true;
      await existing.save();
      return existing;
    }

    return DeviceToken.create({
      user_id: userId,
      token,
      platform,
      is_active: true,
    });
  }

  async unregisterDeviceToken(userId: number, token: string) {
    await DeviceToken.update(
      {
        is_active: false,
      },
      {
        where: {
          user_id: userId,
          token,
        },
      },
    );
  }

  async getTutorUserIdsForAbsentStudents(studentIds: number[]) {
    const students = await Student.findAll({
      where: { id: { [Op.in]: studentIds } },
      include: [
        {
          model: Staff,
          as: 'tutor',
          attributes: ['user_id'],
        },
      ],
    });

    return Array.from(
      new Set(
        students
          .map((student: any) => Number(student?.tutor?.user_id || 0))
          .filter(Boolean),
      ),
    );
  }

  async getHrUserIds() {
    const users = await User.findAll({
      include: [
        {
          association: 'roles',
          where: { name: 'HR' },
          attributes: [],
          through: { attributes: [] },
        },
      ],
      attributes: ['id'],
    });

    return users.map((user) => Number(user.id));
  }

  async getHodUserIdsByDepartment(departmentId: number) {
    const users = await User.findAll({
      include: [
        {
          association: 'roles',
          where: { name: 'HOD' },
          attributes: [],
          through: { attributes: [] },
        },
        {
          association: 'staffProfile',
          where: { department_id: departmentId },
          attributes: [],
        },
      ],
      attributes: ['id'],
    });

    return users.map((user) => Number(user.id));
  }

  private async sendPushNotifications(
    userIds: number[],
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    try {
      const tokens = await DeviceToken.findAll({
        where: {
          user_id: { [Op.in]: userIds },
          is_active: true,
        },
      });

      const expoTokens = Array.from(
        new Set(
          tokens
            .map((token) => token.token)
            .filter((token) => typeof token === 'string' && token.startsWith('ExponentPushToken[')),
        ),
      );

      if (expoTokens.length === 0) {
        return;
      }

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          expoTokens.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data: data ?? {},
          })),
        ),
      });
    } catch (error: any) {
      logger.warn(`Push notification delivery failed: ${error?.message || error}`);
    }
  }
}
