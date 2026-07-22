/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Op } from 'sequelize';
import { Request } from 'express';
import { sequelize } from '../../config/database';
import { AttendanceStatus } from '../../config/enum.config';
import {
  Attendance,
  Department,
  OAAttendance,
  Period,
  Role,
  Staff,
  Student,
  StudentOD,
  User,
  Year,
} from '../../models';
import logger from '../../utils/logger';
import { OAAttendanceReportService } from '../../services/oaAttendanceReport.service';
import { NotificationService } from '../../services/notification.service';
import { ValkeyQueueService } from '../../services/valkeyQueue.service';

interface Context {
  req: Request;
}

type OAAttendanceMode = 'DAY' | 'RANGE' | 'PERIOD';

interface OAAttendanceStudentInput {
  student_id: number;
  status: string;
  reason?: string;
}

interface OAAttendanceStudentsArgs {
  department: string;
  year: string;
  start_date: string;
  end_date?: string;
  mode: OAAttendanceMode;
  period_id?: number;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

interface SaveOAAttendanceArgs {
  department: string;
  year: string;
  start_date: string;
  end_date?: string;
  mode: OAAttendanceMode;
  period_id?: number;
  students: OAAttendanceStudentInput[];
}

interface ExportOAAttendanceArgs {
  department: string;
  year: string;
  start_date: string;
  end_date?: string;
  mode: OAAttendanceMode;
  status?: string;
  search?: string;
}

const parseDate = (date: string) => {
  const [day, month, year] = (date || '').split('.');
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();

  if (isNaN(parsedDate)) {
    throw new Error('Invalid date format. Expected DD.MM.YYYY');
  }

  return parsedDate;
};

const parseDateRange = (startDate: string, endDate?: string, mode?: OAAttendanceMode) => {
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate || startDate);

  if (parsedEndDate < parsedStartDate) {
    throw new Error('End date must be on or after start date.');
  }

  if (mode === 'PERIOD' && parsedEndDate !== parsedStartDate) {
    throw new Error('Period attendance supports only a single date.');
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  if (parsedStartDate > todayStart || parsedEndDate > todayStart) {
    throw new Error('Attendance cannot be updated for a future date.');
  }

  return { parsedStartDate, parsedEndDate };
};

const enumerateDates = (startDate: number, endDate: number) => {
  const dates: number[] = [];
  const msPerDay = 24 * 60 * 60 * 1000;

  for (let current = startDate; current <= endDate; current += msPerDay) {
    dates.push(current);
  }

  return dates;
};

const normalizeAttendanceStatus = (status: string): AttendanceStatus => {
  const upper = (status || '').toUpperCase();

  if (upper === 'PRESENT') return AttendanceStatus.PRESENT;
  if (upper === 'ABSENT') return AttendanceStatus.ABSENT;
  if (upper === 'ON_DUTY' || upper === 'ONDUTY') return AttendanceStatus.ON_DUTY;

  const lower = (status || '').toLowerCase();
  if (lower === AttendanceStatus.PRESENT) return AttendanceStatus.PRESENT;
  if (lower === AttendanceStatus.ABSENT) return AttendanceStatus.ABSENT;
  if (lower === AttendanceStatus.ON_DUTY) return AttendanceStatus.ON_DUTY;

  throw new Error(`Invalid attendance status: ${status}`);
};

const normalizeStatusFilter = (status?: string) => {
  if (!status?.trim()) {
    return null;
  }

  const lower = status.trim().toLowerCase();
  if (['present', 'absent', 'onduty', 'on_duty', 'od', 'mixed'].includes(lower)) {
    if (lower === 'od' || lower === 'onduty' || lower === 'on_duty') return 'onDuty';
    return lower;
  }

  throw new Error(`Invalid status filter: ${status}`);
};

const resolveRangeStatus = ({
  presentDays,
  absentDays,
  odDays,
  totalDays,
}: {
  presentDays: number;
  absentDays: number;
  odDays: number;
  totalDays: number;
}) => {
  if (odDays === totalDays) return 'onDuty';
  if (presentDays === totalDays) return 'present';
  if (absentDays === totalDays) return 'absent';
  return 'mixed';
};

const assertOAAccess = async (authUserId?: number) => {
  if (!authUserId) {
    throw new Error('Unauthorized: Invalid or missing token.');
  }

  const user = await User.findByPk(authUserId, {
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['name'],
      },
    ],
  });

  const isOa = user?.roles?.some((role: any) => role?.name === 'OA');
  if (!isOa) {
    throw new Error('Access denied.');
  }

  const staff = await Staff.findOne({ where: { user_id: authUserId } });
  if (!staff) {
    throw new Error('Staff not found.');
  }

  return staff;
};

const resolveDepartmentAndYear = async (department: string, year: string) => {
  const departmentRecord = await Department.findOne({
    where: {
      [Op.or]: [
        { abbreviation: department.toUpperCase() },
        { name: department.toUpperCase() },
        { name: department },
      ],
    },
  });

  if (!departmentRecord) {
    throw new Error(`Department not found: ${department}`);
  }

  const yearRecord = await Year.findOne({
    where: {
      year,
    },
  });

  if (!yearRecord) {
    throw new Error(`Year not found: ${year}`);
  }

  return {
    departmentId: departmentRecord.id,
    yearId: yearRecord.id,
  };
};

const getStudentsByAcademicFilter = async (
  departmentId: number,
  yearId: number,
  search?: string,
) => {
  const searchValue = search?.trim();

  return Student.findAll({
    where: {
      department_id: departmentId,
      year_id: yearId,
      ...(searchValue
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${searchValue}%` } },
              { roll_no: Number.isNaN(Number(searchValue)) ? -1 : Number(searchValue) },
            ],
          }
        : {}),
    },
    attributes: ['id', 'roll_no', 'name'],
    order: [['roll_no', 'ASC']],
  });
};

export const oaAttendanceMeta = async (_: any, __: any, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    await assertOAAccess(authUser?.id);

    const [departments, years, periods] = await Promise.all([
      Department.findAll({
        attributes: ['name', 'abbreviation'],
        order: [['abbreviation', 'ASC']],
      }),
      Year.findAll({
        attributes: ['year'],
        order: [['id', 'ASC']],
      }),
      Period.findAll({
        attributes: ['id', 'period_number', 'start_time', 'end_time'],
        order: [['start_time', 'ASC']],
      }),
    ]);

    return {
      departments: departments.map((item: any) => ({
        label: item.abbreviation,
        value: item.abbreviation,
      })),
      years: years.map((item: any) => ({
        label: item.year,
        value: item.year,
      })),
      periods: periods.map((item: any) => ({
        id: item.id,
        label: `${item.period_number} (${item.start_time} - ${item.end_time})`,
        period_number: item.period_number,
        start_time: item.start_time,
        end_time: item.end_time,
      })),
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in oaAttendanceMeta: ${error}`);
    throw new Error(error);
  }
};

export const oaAttendanceStudents = async (
  _: any,
  args: OAAttendanceStudentsArgs,
  context: Context,
) => {
  try {
    const authUser = (context.req as any).user;
    await assertOAAccess(authUser?.id);

    const { departmentId, yearId } = await resolveDepartmentAndYear(args.department, args.year);
    const { parsedStartDate, parsedEndDate } = parseDateRange(
      args.start_date,
      args.end_date,
      args.mode,
    );

    if (args.mode === 'PERIOD' && !args.period_id) {
      throw new Error('period_id is required for period mode.');
    }

    const students = await getStudentsByAcademicFilter(departmentId, yearId, args.search);
    const studentIds = students.map((student: any) => student.id);

    if (studentIds.length === 0) {
      return {
        students: [],
        pagination: {
          page: 1,
          page_size: args.page_size || 10,
          total_count: 0,
          total_pages: 0,
        },
        summary: {
          total_students: 0,
          present_count: 0,
          absent_count: 0,
          od_count: 0,
          mixed_count: 0,
        },
      };
    }

    const [dailyAttendanceRows, odRows, periodAttendanceRows] = await Promise.all([
      args.mode === 'PERIOD'
        ? Promise.resolve([])
        : OAAttendance.findAll({
            where: {
              student_id: {
                [Op.in]: studentIds,
              },
              date: {
                [Op.between]: [parsedStartDate, parsedEndDate],
              },
            },
            attributes: ['student_id', 'date', 'status'],
          }),
      StudentOD.findAll({
        where: {
          student_id: {
            [Op.in]: studentIds,
          },
          date: {
            [Op.between]: [parsedStartDate, parsedEndDate],
          },
        },
        attributes: ['student_id', 'date'],
      }),
      args.mode !== 'PERIOD'
        ? Promise.resolve([])
        : Attendance.findAll({
            where: {
              student_id: {
                [Op.in]: studentIds,
              },
              period_id: args.period_id,
              date: parsedStartDate,
            },
            attributes: ['student_id', 'status'],
          }),
    ]);

    const odMap = new Set(odRows.map((row: any) => `${row.student_id}_${row.date}`));
    const dailyAttendanceMap = new Map(
      dailyAttendanceRows.map((row: any) => [`${row.student_id}_${row.date}`, row.status]),
    );
    const periodAttendanceMap = new Map(
      periodAttendanceRows.map((row: any) => [row.student_id, row.status]),
    );

    const dates = enumerateDates(parsedStartDate, parsedEndDate);
    const derivedStudents = students.map((student: any) => {
      if (args.mode === 'PERIOD') {
        const isOd = odMap.has(`${student.id}_${parsedStartDate}`);
        const status = isOd
          ? 'onDuty'
          : periodAttendanceMap.get(student.id) === AttendanceStatus.PRESENT
            ? 'present'
            : 'absent';

        return {
          student_id: student.id,
          rollNumber: student.roll_no,
          name: student.name,
          status,
          present_days: status === 'present' ? 1 : 0,
          absent_days: status === 'absent' ? 1 : 0,
          od_days: status === 'onDuty' ? 1 : 0,
          total_days: 1,
        };
      }

      let presentDays = 0;
      let absentDays = 0;
      let odDays = 0;

      for (const date of dates) {
        const key = `${student.id}_${date}`;
        if (odMap.has(key)) {
          odDays += 1;
          continue;
        }

        const status = dailyAttendanceMap.get(key);
        if (status === AttendanceStatus.PRESENT) {
          presentDays += 1;
        } else {
          absentDays += 1;
        }
      }

      return {
        student_id: student.id,
        rollNumber: student.roll_no,
        name: student.name,
        status: resolveRangeStatus({
          presentDays,
          absentDays,
          odDays,
          totalDays: dates.length,
        }),
        present_days: presentDays,
        absent_days: absentDays,
        od_days: odDays,
        total_days: dates.length,
      };
    });

    const normalizedStatusFilter = normalizeStatusFilter(args.status);
    const filteredStudents = normalizedStatusFilter
      ? derivedStudents.filter((student) => student.status === normalizedStatusFilter)
      : derivedStudents;

    const pageSize = Math.max(1, args.page_size || 10);
    const totalCount = filteredStudents.length;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
    const page = Math.min(Math.max(1, args.page || 1), totalPages || 1);
    const startIndex = (page - 1) * pageSize;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

    const summary = derivedStudents.reduce(
      (acc, student) => {
        acc.total_students += 1;
        if (student.status === 'present') acc.present_count += 1;
        else if (student.status === 'absent') acc.absent_count += 1;
        else if (student.status === 'onDuty') acc.od_count += 1;
        else acc.mixed_count += 1;
        return acc;
      },
      {
        total_students: 0,
        present_count: 0,
        absent_count: 0,
        od_count: 0,
        mixed_count: 0,
      },
    );

    return {
      students: paginatedStudents,
      pagination: {
        page,
        page_size: pageSize,
        total_count: totalCount,
        total_pages: totalPages,
      },
      summary,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in oaAttendanceStudents: ${error}`);
    throw new Error(error);
  }
};

export const saveOAAttendance = async (_: any, args: SaveOAAttendanceArgs, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    const staff = await assertOAAccess(authUser?.id);

    const { departmentId, yearId } = await resolveDepartmentAndYear(args.department, args.year);
    const { parsedStartDate, parsedEndDate } = parseDateRange(
      args.start_date,
      args.end_date,
      args.mode,
    );

    if (!Array.isArray(args.students) || args.students.length === 0) {
      throw new Error('students is required.');
    }

    if (args.mode === 'PERIOD' && !args.period_id) {
      throw new Error('period_id is required for period mode.');
    }

    const allowedStudents = await Student.findAll({
      where: {
        id: {
          [Op.in]: args.students.map((item) => item.student_id),
        },
        department_id: departmentId,
        year_id: yearId,
      },
      attributes: ['id'],
    });

    const allowedStudentIds = new Set(allowedStudents.map((item: any) => item.id));
    const invalidStudent = args.students.find((item) => !allowedStudentIds.has(item.student_id));
    if (invalidStudent) {
      throw new Error(`Student ${invalidStudent.student_id} is not part of the selected department/year.`);
    }

    const dates = enumerateDates(parsedStartDate, parsedEndDate);

    await sequelize.transaction(async (transaction) => {
      for (const item of args.students) {
        const normalizedStatus = normalizeAttendanceStatus(item.status);

        for (const date of dates) {
          await OAAttendance.destroy({
            where: {
              student_id: item.student_id,
              date,
            },
            transaction,
          });

          if (args.mode === 'PERIOD') {
            await Attendance.destroy({
              where: {
                student_id: item.student_id,
                date,
                ...(normalizedStatus === AttendanceStatus.ON_DUTY
                  ? {}
                  : { period_id: args.period_id }),
              },
              transaction,
            });
          } else {
            await Attendance.destroy({
              where: {
                student_id: item.student_id,
                date,
              },
              transaction,
            });
          }

          if (normalizedStatus === AttendanceStatus.ON_DUTY) {
            await StudentOD.destroy({
              where: {
                student_id: item.student_id,
                date,
              },
              transaction,
            });

            await StudentOD.create(
              {
                student_id: item.student_id,
                date,
                reason: item.reason?.trim() || 'Marked by OA',
                updated_at: new Date(),
              },
              { transaction },
            );
            continue;
          }

          await StudentOD.destroy({
            where: {
              student_id: item.student_id,
              date,
            },
            transaction,
          });

          if (args.mode === 'PERIOD') {
            await Attendance.create(
              {
                student_id: item.student_id,
                period_id: args.period_id!,
                date,
                status: normalizedStatus,
                updated_at: new Date(),
              },
              { transaction },
            );
            continue;
          }

          await OAAttendance.create(
            {
              student_id: item.student_id,
              marked_by_staff_id: staff.id,
              date,
              status: normalizedStatus === AttendanceStatus.PRESENT
                ? AttendanceStatus.PRESENT
                : AttendanceStatus.ABSENT,
              updated_at: new Date(),
            },
            { transaction },
          );
        }
      }
    });

    const absentStudentIds = args.students
      .filter((item) => normalizeAttendanceStatus(item.status) === AttendanceStatus.ABSENT)
      .map((item) => item.student_id);

    if (absentStudentIds.length > 0) {
      const tutorUserIds =
        await NotificationService.getInstance().getTutorUserIdsForAbsentStudents(
          absentStudentIds,
        );

      await NotificationService.getInstance().createNotifications({
        userIds: tutorUserIds,
        title: 'OA Attendance Update',
        message: `${absentStudentIds.length} student(s) were marked absent by OA attendance.`,
        type: 'OA_ATTENDANCE_ABSENT',
        entityType: 'oa_attendance',
        data: {
          mode: args.mode,
          start_date: args.start_date,
          end_date: args.end_date ?? null,
          student_ids: absentStudentIds,
        },
      });
    }

    return {
      success: true,
      affected_students: args.students.length,
      affected_dates: dates.length,
      mode: args.mode,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in saveOAAttendance: ${error}`);
    throw new Error(error);
  }
};

export const oaAttendanceReportStudents = async (
  _: any,
  args: OAAttendanceStudentsArgs,
  context: Context,
) => {
  try {
    const authUser = (context.req as any).user;
    await assertOAAccess(authUser?.id);

    if (args.mode === 'PERIOD') {
      throw new Error('Report view supports only day or range mode.');
    }

    return OAAttendanceReportService.getInstance().getReportData({
      department: args.department,
      year: args.year,
      start_date: args.start_date,
      end_date: args.end_date,
      mode: args.mode,
      status: args.status,
      search: args.search,
      page: args.page,
      page_size: args.page_size,
    });
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in oaAttendanceReportStudents: ${error}`);
    throw new Error(error);
  }
};

export const exportOAAttendanceReport = async (
  _: any,
  args: ExportOAAttendanceArgs,
  context: Context,
) => {
  try {
    const authUser = (context.req as any).user;
    const staff = await assertOAAccess(authUser?.id);

    if (args.mode === 'PERIOD') {
      throw new Error('Report export supports only day or range mode.');
    }

    void ValkeyQueueService.getInstance()
      .enqueueOAAttendanceExport({
        email: staff.email,
        userName: staff.name,
        filters: {
          department: args.department,
          year: args.year,
          start_date: args.start_date,
          end_date: args.end_date,
          mode: args.mode as 'DAY' | 'RANGE',
          status: args.status,
          search: args.search,
        },
      })
      .catch((queueError: any) => {
        logger.error(
          `Failed to enqueue OA attendance export for ${staff.email}: ${
            queueError?.message || queueError
          }`,
        );
      });

    return {
      success: true,
      message: 'Attendance export is being prepared and will be emailed shortly.',
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in exportOAAttendanceReport: ${error}`);
    throw new Error(error);
  }
};
