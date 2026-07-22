import { Op } from 'sequelize';
import { Attendance, Staff, Timetable } from '../models';
import { NotificationService } from './notification.service';
import logger from '../utils/logger';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const getIstDate = () => new Date(Date.now() + IST_OFFSET_MS);

const getIstDateKey = () => {
  const date = getIstDate();
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate(),
  ).padStart(2, '0')}`;
};

const getIstDayCode = () => {
  const codes = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return codes[getIstDate().getUTCDay()];
};

const getTodayStartInIstMs = () => {
  const date = getIstDate();
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - IST_OFFSET_MS;
};

export class AttendanceReminderService {
  private static instance: AttendanceReminderService;
  private timer: NodeJS.Timeout | null = null;
  private lastRunDateKey = '';

  static getInstance() {
    if (!AttendanceReminderService.instance) {
      AttendanceReminderService.instance = new AttendanceReminderService();
    }

    return AttendanceReminderService.instance;
  }

  start() {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      this.run().catch((error) => {
        logger.error(`Attendance reminder run failed: ${error?.message || error}`);
      });
    }, 60 * 1000);
  }

  async run() {
    const now = getIstDate();
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const dateKey = getIstDateKey();

    if (hours !== 17 || minutes !== 0 || this.lastRunDateKey === dateKey) {
      return;
    }

    this.lastRunDateKey = dateKey;

    const dayCode = getIstDayCode();
    if (dayCode === 'SUN') {
      return;
    }

    const todayMs = getTodayStartInIstMs();

    const timetables = await Timetable.findAll({
      where: {
        day_of_week: dayCode as any,
        status: 'ACTIVE',
      },
      attributes: ['staff_id', 'period_id'],
    });

    const missingStaffIds = new Set<number>();

    for (const timetable of timetables) {
      const count = await Attendance.count({
        where: {
          period_id: timetable.period_id,
          date: todayMs,
        },
      });

      if (count === 0) {
        missingStaffIds.add(Number(timetable.staff_id));
      }
    }

    if (missingStaffIds.size === 0) {
      return;
    }

    const staffMembers = await Staff.findAll({
      where: {
        id: { [Op.in]: Array.from(missingStaffIds) },
      },
      attributes: ['user_id', 'name'],
    });

    await NotificationService.getInstance().createNotifications({
      userIds: staffMembers.map((staff) => Number(staff.user_id)),
      title: 'Attendance Reminder',
      message:
        'One or more attendance entries appear to be missing for today. Please review and submit before the day ends.',
      type: 'ATTENDANCE_REMINDER',
      entityType: 'attendance',
      data: {
        date: dateKey,
      },
    });
  }
}
