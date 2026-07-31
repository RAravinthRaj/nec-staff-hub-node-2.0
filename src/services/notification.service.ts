/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { NotificationModel, PeriodAttendance, StaffCourse, StudentDetails, Timetable, User } from '../models';
import cron from 'node-cron';
import logger from '../utils/logger';

export class NotificationService {
  static async getUserNotifications(userId: number, filter?: string) {
    const whereClause: any = { userId };
    if (filter === 'unread') {
      whereClause.isRead = false;
    }

    const notifications = await NotificationModel.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await NotificationModel.count({
      where: { userId, isRead: false },
    });

    return {
      notifications: notifications.map((n) => ({
        id: n.notificationId,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
        createdAt: n.createdAt,
      })),
      unreadCount,
    };
  }

  static async markAsRead(notificationId: number, userId: number) {
    const notification = await NotificationModel.findOne({
      where: { notificationId, userId },
    });
    if (notification) {
      notification.isRead = true;
      await notification.save();
    }
    return { success: true };
  }

  static async runDaily5PMCronCheck() {
    logger.info('⏰ Running 5:00 PM IST Daily Notification Cron Check...');
    const todayStr = new Date().toISOString().split('T')[0];
    const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const d = new Date();
    const dayOfWeek = dayMap[d.getDay()];

    if (dayOfWeek === 'SUN') {
      logger.info('Sunday - Skipping attendance cron check.');
      return;
    }

    try {
      // 1. Task A: Check staff who forgot to submit attendance for today's classes
      const todayTimetable = await Timetable.findAll({
        where: { dayOfWeek, isActive: 'YES' },
      });

      for (const tt of todayTimetable) {
        const attendanceCount = await PeriodAttendance.count({
          where: {
            courseId: tt.courseId,
            sectionId: tt.sectionId || 1,
            periodNumber: tt.periodNumber,
            attendanceDate: todayStr,
          },
        });

        if (attendanceCount === 0) {
          // Find staff assigned to this course & section
          const staffAssignments = await StaffCourse.findAll({
            where: { courseId: tt.courseId, sectionId: tt.sectionId || 1 },
          });

          for (const sa of staffAssignments) {
            await NotificationModel.create({
              userId: sa.Userid,
              title: 'Attendance Reminder',
              message: `You have not submitted attendance for Period ${tt.periodNumber} today.`,
              type: 'REMINDER',
              isRead: false,
              metadata: JSON.stringify({
                courseId: tt.courseId,
                sectionId: tt.sectionId,
                periodNumber: tt.periodNumber,
                date: todayStr,
              }),
            });
          }
        }
      }

      // 2. Task B: Check tutor wards absent today and notify tutors at 5:00 PM IST
      const tutors = await User.findAll({
        where: { roleId: [1, 2] }, // Staff or Dept Admin
      });

      for (const tutor of tutors) {
        const wards = await StudentDetails.findAll({
          where: { staffId: tutor.userId },
        });

        for (const ward of wards) {
          const absentRecords = await PeriodAttendance.findAll({
            where: {
              regno: ward.registerNumber,
              attendanceDate: todayStr,
              status: 'A',
            },
            order: [['periodNumber', 'ASC']],
          });

          if (absentRecords.length > 0) {
            const absentPeriods = absentRecords.map((r) => r.periodNumber);
            const periodStr = absentPeriods.join(', ');
            const message = `Your tutor ward ${ward.studentName} - ${ward.registerNumber} has been absent on period number(s): ${periodStr}.`;

            await NotificationModel.create({
              userId: tutor.userId,
              title: 'Tutor Ward Absence Alert',
              message,
              type: 'ABSENCE',
              isRead: false,
              metadata: JSON.stringify({
                regno: ward.registerNumber,
                studentName: ward.studentName,
                absentPeriods,
                date: todayStr,
              }),
            });
          }
        }
      }
      logger.info('✅ 5:00 PM IST Daily Notification Cron Check completed.');
    } catch (err: any) {
      logger.error('❌ Error in 5:00 PM IST Daily Notification Cron Check:', err);
    }
  }

  static initCronJob() {
    // Schedule cron for 5:00 PM IST daily (17:00 IST = 11:30 UTC -> '30 11 * * *')
    cron.schedule('30 11 * * *', () => {
      this.runDaily5PMCronCheck();
    });
    logger.info('⏰ Daily 5:00 PM IST Notification Cron Job scheduled.');
  }
}
