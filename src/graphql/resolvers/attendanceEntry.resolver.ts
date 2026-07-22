/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Attendance, Staff } from '../../models';
import { AttendanceStatus } from '../../config/enum.config';
import { NotificationService } from '../../services/notification.service';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

interface AttendanceInputItem {
  student_id: number;
  status: string;
}

const parseDate = (date: string) => {
  const [day, month, year] = date.split('.');
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();

  if (isNaN(parsedDate)) {
    throw new Error('Invalid date format');
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  if (parsedDate > todayStart) {
    throw new Error(`Attendance can't be updated for a future date: ${date}.`);
  }

  return parsedDate;
};

const normalizeStatus = (status: string): AttendanceStatus => {
  const upper = status.toUpperCase();

  if (upper === 'PRESENT') return AttendanceStatus.PRESENT;
  if (upper === 'ABSENT') return AttendanceStatus.ABSENT;
  if (upper === 'ON_DUTY' || upper === 'ONDUTY') {
    return AttendanceStatus.ON_DUTY;
  }

  const lower = status.toLowerCase();
  if (lower === AttendanceStatus.PRESENT) return AttendanceStatus.PRESENT;
  if (lower === AttendanceStatus.ABSENT) return AttendanceStatus.ABSENT;
  if (lower === AttendanceStatus.ON_DUTY) return AttendanceStatus.ON_DUTY;

  throw new Error(`Invalid attendance status: ${status}`);
};

export const attendanceEntry = async (
  _: any,
  {
    period_id,
    date,
    students,
  }: { period_id: number; date: string; students: AttendanceInputItem[] },
  context: Context,
) => {
  try {
    const authUser = (context.req as any).user;

    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    if (!Array.isArray(students) || students.length === 0) {
      throw new Error('Students list is required.');
    }

    const staff = await Staff.findOne({ where: { user_id: authUser.id } });

    if (!staff) {
      throw new Error('Staff not found.');
    }

    const parsedDate = parseDate(date);

    const studentMap = new Map<number, AttendanceStatus>();
    for (const item of students) {
      if (!item?.student_id) {
        throw new Error('Each student item must include student_id.');
      }
      studentMap.set(item.student_id, normalizeStatus(item.status));
    }

    const attendanceRows = Array.from(studentMap.entries()).map(([student_id, status]) => ({
      student_id,
      period_id,
      date: parsedDate,
      status,
    }));

    await Attendance.bulkCreate(attendanceRows, {
      updateOnDuplicate: ['status'],
    });

    const absentStudentIds = attendanceRows
      .filter((row) => row.status === AttendanceStatus.ABSENT)
      .map((row) => row.student_id);

    if (absentStudentIds.length > 0) {
      const tutorUserIds =
        await NotificationService.getInstance().getTutorUserIdsForAbsentStudents(
          absentStudentIds,
        );

      await NotificationService.getInstance().createNotifications({
        userIds: tutorUserIds,
        title: 'Absent Students Marked',
        message: `${absentStudentIds.length} student(s) were marked absent in attendance.`,
        type: 'ATTENDANCE_ABSENT',
        entityType: 'attendance',
        entityId: period_id,
        data: {
          date,
          period_id,
          student_ids: absentStudentIds,
        },
      });
    }

    return {
      success: true,
      totalStudentCount: attendanceRows.length,
      period_id,
      date,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in attendanceEntry: ${error}`);
    throw new Error(error);
  }
};
