/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { AttendanceStatus } from '../config/enum.config';
import { Attendance, Department, OAAttendance, Period, Student, StudentOD, Year } from '../models';

export type OAReportMode = 'DAY' | 'RANGE';

export interface OAReportFilters {
  department: string;
  year: string;
  start_date: string;
  end_date?: string;
  mode: OAReportMode;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

interface ReportStudentRow {
  student_id: number;
  rollNumber: number;
  name: string;
  status: 'present' | 'absent' | 'onDuty' | 'mixed';
  present_days: number;
  absent_days: number;
  od_days: number;
  total_days: number;
}

const parseDate = (date: string) => {
  const [day, month, year] = (date || '').split('.');
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();

  if (isNaN(parsedDate)) {
    throw new Error('Invalid date format. Expected DD.MM.YYYY');
  }

  return parsedDate;
};

const parseDateRange = (startDate: string, endDate?: string, mode?: OAReportMode) => {
  const parsedStartDate = parseDate(startDate);
  const parsedEndDate = parseDate(endDate || startDate);

  if (parsedEndDate < parsedStartDate) {
    throw new Error('End date must be on or after start date.');
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  if (parsedStartDate > todayStart || parsedEndDate > todayStart) {
    throw new Error('Attendance cannot be fetched for a future date.');
  }

  if (mode === 'DAY' && parsedStartDate !== parsedEndDate) {
    throw new Error('Day mode supports only a single date.');
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
  if (odDays === totalDays) return 'onDuty' as const;
  if (presentDays === totalDays) return 'present' as const;
  if (absentDays === totalDays) return 'absent' as const;
  return 'mixed' as const;
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
    departmentLabel: departmentRecord.abbreviation || departmentRecord.name,
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

const getFirstPeriodId = async () => {
  const firstPeriod = await Period.findOne({
    attributes: ['id'],
    order: [['start_time', 'ASC']],
  });

  if (!firstPeriod?.id) {
    throw new Error('No periods configured.');
  }

  return firstPeriod.id;
};

export class OAAttendanceReportService {
  private static instance: OAAttendanceReportService;

  static getInstance() {
    if (!OAAttendanceReportService.instance) {
      OAAttendanceReportService.instance = new OAAttendanceReportService();
    }

    return OAAttendanceReportService.instance;
  }

  async getReportData(filters: OAReportFilters) {
    const { departmentId, yearId, departmentLabel } = await resolveDepartmentAndYear(
      filters.department,
      filters.year,
    );
    const { parsedStartDate, parsedEndDate } = parseDateRange(
      filters.start_date,
      filters.end_date,
      filters.mode,
    );

    const students = await getStudentsByAcademicFilter(departmentId, yearId, filters.search);
    const studentIds = students.map((student: any) => student.id);
    const pageSize = Math.max(1, filters.page_size || 10);

    if (studentIds.length === 0) {
      return {
        students: [],
        filtered_students: [],
        pagination: {
          page: 1,
          page_size: pageSize,
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
        export_meta: {
          department_label: departmentLabel,
          year: filters.year,
          start_date: filters.start_date,
          end_date: filters.end_date || filters.start_date,
          mode: filters.mode,
        },
      };
    }

    const [dailyAttendanceRows, odRows, firstPeriodId] = await Promise.all([
      OAAttendance.findAll({
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
      getFirstPeriodId(),
    ]);

    const firstPeriodAttendanceRows = await Attendance.findAll({
      where: {
        student_id: {
          [Op.in]: studentIds,
        },
        period_id: firstPeriodId,
        date: {
          [Op.between]: [parsedStartDate, parsedEndDate],
        },
      },
      attributes: ['student_id', 'date', 'status'],
    });

    const odMap = new Set(odRows.map((row: any) => `${row.student_id}_${row.date}`));
    const dailyAttendanceMap = new Map(
      dailyAttendanceRows.map((row: any) => [`${row.student_id}_${row.date}`, row.status]),
    );
    const firstPeriodMap = new Map(
      firstPeriodAttendanceRows.map((row: any) => [`${row.student_id}_${row.date}`, row.status]),
    );

    const dates = enumerateDates(parsedStartDate, parsedEndDate);
    const derivedStudents: ReportStudentRow[] = students.map((student: any) => {
      let presentDays = 0;
      let absentDays = 0;
      let odDays = 0;

      for (const date of dates) {
        const key = `${student.id}_${date}`;
        if (odMap.has(key)) {
          odDays += 1;
          continue;
        }

        const status =
          dailyAttendanceMap.get(key) ||
          firstPeriodMap.get(key) ||
          AttendanceStatus.ABSENT;

        if (status === AttendanceStatus.PRESENT) {
          presentDays += 1;
        } else {
          absentDays += 1;
        }
      }

      return {
        student_id: student.id,
        rollNumber: Number(student.roll_no),
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

    const normalizedStatusFilter = normalizeStatusFilter(filters.status);
    const filteredStudents = normalizedStatusFilter
      ? derivedStudents.filter((student) => student.status === normalizedStatusFilter)
      : derivedStudents;

    const totalCount = filteredStudents.length;
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize);
    const page = Math.min(Math.max(1, filters.page || 1), totalPages || 1);
    const startIndex = (page - 1) * pageSize;

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
      students: filteredStudents.slice(startIndex, startIndex + pageSize),
      filtered_students: filteredStudents,
      pagination: {
        page,
        page_size: pageSize,
        total_count: totalCount,
        total_pages: totalPages,
      },
      summary,
      export_meta: {
        department_label: departmentLabel,
        year: filters.year,
        start_date: filters.start_date,
        end_date: filters.end_date || filters.start_date,
        mode: filters.mode,
      },
    };
  }

  async buildWorkbookBuffer(filters: OAReportFilters) {
    const reportData = await this.getReportData({
      ...filters,
      page: 1,
      page_size: 100000,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OA Attendance Report');

    worksheet.columns = [
      { header: 'Roll Number', key: 'rollNumber', width: 16 },
      { header: 'Student Name', key: 'name', width: 28 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Present Days', key: 'present_days', width: 14 },
      { header: 'Absent Days', key: 'absent_days', width: 14 },
      { header: 'OD Days', key: 'od_days', width: 12 },
      { header: 'Total Days', key: 'total_days', width: 12 },
    ];

    worksheet.addRow([]);
    worksheet.addRow(['Department', reportData.export_meta.department_label]);
    worksheet.addRow(['Year', reportData.export_meta.year]);
    worksheet.addRow(['Mode', reportData.export_meta.mode]);
    worksheet.addRow(['Start Date', reportData.export_meta.start_date]);
    worksheet.addRow(['End Date', reportData.export_meta.end_date]);
    worksheet.addRow([]);
    worksheet.addRow(worksheet.columns.map((column) => column.header));

    reportData.filtered_students.forEach((student) => {
      worksheet.addRow({
        rollNumber: student.rollNumber,
        name: student.name,
        status: student.status,
        present_days: student.present_days,
        absent_days: student.absent_days,
        od_days: student.od_days,
        total_days: student.total_days,
      });
    });

    return workbook.xlsx.writeBuffer();
  }
}
