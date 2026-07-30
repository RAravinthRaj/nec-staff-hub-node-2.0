/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { PeriodAttendance, StudentDetails, Timetable, User, StaffDetails } from '../models';
import { Op } from 'sequelize';

export class AttendanceService {
  private static formatStatus(inputStatus: string): 'P' | 'A' | 'OD' {
    const s = (inputStatus || '').toUpperCase().trim();
    if (s === 'P' || s === 'PRESENT') return 'P';
    if (s === 'OD' || s === 'ON-DUTY' || s === 'ON_DUTY' || s === 'ONDUTY') return 'OD';
    return 'A'; // Default to ABSENT if missing or invalid
  }

  static async submitAttendance(payload: {
    staffId: number;
    courseId: number;
    sectionId: number;
    periodNumber: number;
    attendanceDate: string;
    dayOfWeek?: string;
    semesterNumber?: number;
    departmentId?: number;
    records: Array<{ regno?: string; registerNumber?: string; status: string }>;
  }) {
    const { staffId, courseId, sectionId, periodNumber, attendanceDate, records } = payload;

    // Validate future date
    const todayStr = new Date().toISOString().split('T')[0];
    if (attendanceDate > todayStr) {
      throw new Error('Attendance date cannot be in the future');
    }

    const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const d = new Date(attendanceDate);
    const dayOfWeek = payload.dayOfWeek || dayMap[d.getDay()] || 'MON';

    const results = [];

    for (const item of records) {
      const regno = item.regno || item.registerNumber;
      if (!regno) continue;

      const targetStatus = this.formatStatus(item.status);

      const existingRecord = await PeriodAttendance.findOne({
        where: {
          regno,
          courseId,
          sectionId,
          attendanceDate,
          periodNumber,
        },
      });

      if (existingRecord) {
        // If status is OD, staff cannot override OD
        if (existingRecord.status === 'OD') {
          results.push(existingRecord);
          continue;
        }

        existingRecord.status = targetStatus;
        existingRecord.staffId = staffId;
        await existingRecord.save();
        results.push(existingRecord);
      } else {
        const newRecord = await PeriodAttendance.create({
          regno,
          staffId,
          courseId,
          sectionId,
          semesterNumber: payload.semesterNumber || 5,
          dayOfWeek,
          periodNumber,
          attendanceDate,
          status: targetStatus,
          departmentId: payload.departmentId || 1,
          updatedBy: `Staff-${staffId}`,
        });
        results.push(newRecord);
      }
    }

    return {
      message: 'Attendance saved successfully',
      count: results.length,
      records: results,
    };
  }

  static async copyAttendance(payload: {
    targetDate: string;
    targetPeriodNumber: number;
    currentCourseId: number;
    currentSectionId: number;
  }) {
    const { targetDate, targetPeriodNumber, currentCourseId, currentSectionId } = payload;

    // Verify course & section match for the target period
    const targetTimetable = await Timetable.findOne({
      where: {
        periodNumber: targetPeriodNumber,
        courseId: currentCourseId,
        sectionId: currentSectionId,
      },
    });

    const targetAttendanceCount = await PeriodAttendance.count({
      where: {
        attendanceDate: targetDate,
        periodNumber: targetPeriodNumber,
        courseId: currentCourseId,
        sectionId: currentSectionId,
      },
    });

    if (!targetTimetable && targetAttendanceCount === 0) {
      throw new Error('Course or section does not match the current period for the selected date');
    }

    const pastRecords = await PeriodAttendance.findAll({
      where: {
        attendanceDate: targetDate,
        periodNumber: targetPeriodNumber,
        courseId: currentCourseId,
        sectionId: currentSectionId,
      },
      include: [{ model: StudentDetails, as: 'studentDetails' }],
    });

    if (!pastRecords || pastRecords.length === 0) {
      throw new Error('No attendance records found for the selected date and period');
    }

    return pastRecords.map((rec) => ({
      regno: rec.regno,
      registerNumber: rec.regno,
      studentName: rec.studentDetails?.studentName || rec.regno,
      status: rec.status === 'P' ? 'PRESENT' : rec.status === 'OD' ? 'OD' : 'ABSENT',
    }));
  }

  static async filterAttendanceRecords(authUser: any, query: any) {
    const roleName = authUser.role || 'Staff';
    const isDeptAdmin = roleName === 'Department Admin' || roleName === 'HOD';
    const staffId = authUser.staffId || authUser.userId;
    const targetDate = query.date || new Date().toISOString().split('T')[0];

    if (!isDeptAdmin) {
      // Staff / Tutor view: Only fetch tutees/wards assigned to this staffId (tutorId)
      const students = await StudentDetails.findAll({
        where: { staffId },
        include: [{ model: User, as: 'user' }],
        order: [['registerNumber', 'ASC']],
      });

      const regnos = students.map((s) => s.registerNumber);
      const attendanceRecords = await PeriodAttendance.findAll({
        where: {
          regno: regnos,
          attendanceDate: targetDate,
        },
      });

      const statusMap: Record<string, string> = {};
      attendanceRecords.forEach((rec) => {
        statusMap[rec.regno] = rec.status === 'P' ? 'PRESENT' : rec.status === 'OD' ? 'ON_DUTY' : 'ABSENT';
      });

      return {
        isDeptAdmin: false,
        total: students.length,
        data: students.map((s) => ({
          studentId: s.studentId,
          registerNumber: s.registerNumber,
          studentName: s.studentName,
          batch: s.batch,
          semester: s.semester,
          status: statusMap[s.registerNumber] || 'ABSENT',
        })),
      };
    }

    // Department Admin (HOD) view with pagination & required filter check
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 10));
    const offset = (page - 1) * limit;

    const hasFilters = query.departmentId || query.year || query.sectionId || query.date || query.batch || query.search;
    if (!hasFilters) {
      return {
        isDeptAdmin: true,
        requiresFilter: true,
        message: 'Please select filters to view student records',
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }

    const whereClause: any = {};
    if (query.departmentId) whereClause.departmentId = query.departmentId;
    if (query.batch) whereClause.batch = query.batch;

    // Year to Semester mapping: 2nd year -> [3, 4], 3rd year -> [5, 6], 4th year -> [7, 8]
    const yearVal = String(query.year || '').trim();
    if (yearVal) {
      if (yearVal === '2' || yearVal.includes('2')) {
        whereClause.semester = ['3', '4', 'III', 'IV', 3, 4];
      } else if (yearVal === '3' || yearVal.includes('3')) {
        whereClause.semester = ['5', '6', 'V', 'VI', 5, 6];
      } else if (yearVal === '4' || yearVal.includes('4')) {
        whereClause.semester = ['7', '8', 'VII', 'VIII', 7, 8];
      }
    }

    if (query.search) {
      whereClause[Op.or] = [
        { registerNumber: { [Op.like]: `%${query.search}%` } },
        { studentName: { [Op.like]: `%${query.search}%` } },
      ];
    }

    let { count, rows } = await StudentDetails.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['registerNumber', 'ASC']],
    });

    // Fallback if year/semester filter returned 0 rows
    if (count === 0 && query.departmentId) {
      const fallback = await StudentDetails.findAndCountAll({
        where: { departmentId: query.departmentId },
        limit,
        offset,
        order: [['registerNumber', 'ASC']],
      });
      count = fallback.count;
      rows = fallback.rows;
    }

    const regnos = rows.map((s) => s.registerNumber);
    const attendanceRecords = await PeriodAttendance.findAll({
      where: {
        regno: regnos,
        attendanceDate: targetDate,
      },
    });

    const statusMap: Record<string, string> = {};
    attendanceRecords.forEach((rec) => {
      statusMap[rec.regno] = rec.status === 'P' ? 'PRESENT' : rec.status === 'OD' ? 'ON_DUTY' : 'ABSENT';
    });

    return {
      isDeptAdmin: true,
      requiresFilter: false,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      data: rows.map((s) => ({
        studentId: s.studentId,
        registerNumber: s.registerNumber,
        studentName: s.studentName,
        batch: s.batch,
        semester: s.semester,
        status: statusMap[s.registerNumber] || 'ABSENT',
      })),
    };
  }
}
