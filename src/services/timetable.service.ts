/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Timetable, StaffCourse, Course, Section, Period, Semester, StudentCourse, StudentDetails, User, StaffDetails, PeriodAttendance } from '../models';

export class TimetableService {
  private static getRomanSemester(num: number): string {
    const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' };
    return map[num] || 'V';
  }

  private static getYearString(semNum: number): string {
    if (semNum <= 2) return 'I';
    if (semNum <= 4) return 'II';
    if (semNum <= 6) return 'III';
    return 'IV';
  }

  static async getStaffTimetable(userId: number, dayOfWeek: string, date?: string) {
    const day = (dayOfWeek || 'MON').toUpperCase();
    const targetDate = date || new Date().toISOString().split('T')[0];

    // 1. Fetch Staff info
    const user = await User.findByPk(userId, {
      include: [{ model: StaffDetails, as: 'staffDetails' }],
    });
    const staffName = user?.userName || (user?.staffDetails ? `${user.staffDetails.firstName} ${user.staffDetails.lastName || ''}`.trim() : 'Staff');

    // 2. Fetch Staff Course Assignments
    const staffCourses = await StaffCourse.findAll({ where: { Userid: userId } });
    const assignedCourseIds = staffCourses.map((sc) => sc.courseId);

    // 3. Query Timetable for Day
    const whereClause: any = {
      dayOfWeek: day,
      isActive: 'YES',
    };

    if (assignedCourseIds.length > 0) {
      whereClause.courseId = assignedCourseIds;
    }

    const timetableEntries = await Timetable.findAll({
      where: whereClause,
      include: [
        { model: Course, as: 'course' },
        { model: Section, as: 'section' },
        { model: Period, as: 'period' },
        { model: Semester, as: 'semester' },
      ],
      order: [['periodNumber', 'ASC']],
    });

    if (!timetableEntries || timetableEntries.length === 0) {
      return [];
    }

    // 4. Check if PeriodAttendance records exist for each timetable entry
    const results = await Promise.all(
      timetableEntries.map(async (tt: any) => {
        const attendanceCount = await PeriodAttendance.count({
          where: {
            courseId: tt.courseId,
            sectionId: tt.sectionId || 1,
            periodNumber: tt.periodNumber,
            attendanceDate: targetDate,
          },
        });

        return {
          id: tt.timetableId,
          courseCode: tt.course?.courseCode || `CS${tt.courseId}`,
          courseName: tt.course?.courseTitle || 'Subject Course',
          subName: tt.course?.courseTitle || 'Subject Course',
          startTime: tt.period?.startTime || '09:00:00',
          endTime: tt.period?.endTime || '10:00:00',
          batch: tt.section ? `CSE ${tt.section.sectionName}` : 'CSE A',
          year: tt.semester ? this.getYearString(tt.semester.semesterNumber) : 'III',
          faculty: staffName,
          semester: tt.semester ? this.getRomanSemester(tt.semester.semesterNumber) : 'V',
          courseBatchId: tt.timetableId,
          periodId: tt.periodNumber,
          courseId: tt.courseId,
          sectionId: tt.sectionId || 1,
          isAttendanceMarked: attendanceCount > 0,
        };
      })
    );

    return results;
  }

  static async getStudentsForAttendance(courseId: number, sectionId: number, date?: string, periodNumber?: number) {
    // Tier 1: Match studentcourse by exact courseId & sectionId
    let studentCourses = await StudentCourse.findAll({
      where: { courseId, sectionId },
      include: [{ model: StudentDetails, as: 'studentDetails' }],
    });

    // Tier 2: Match studentcourse by courseId alone
    if (!studentCourses || studentCourses.length === 0) {
      studentCourses = await StudentCourse.findAll({
        where: { courseId },
        include: [{ model: StudentDetails, as: 'studentDetails' }],
      });
    }

    let rawStudents: Array<{ studentId: number; registerNumber: string; studentName: string }> = [];

    // Tier 3: Fallback to all student_details if no course mapping found
    if (!studentCourses || studentCourses.length === 0) {
      const students = await StudentDetails.findAll({ order: [['registerNumber', 'ASC']], limit: 50 });
      rawStudents = students.map((s) => ({
        studentId: s.studentId,
        registerNumber: s.registerNumber,
        studentName: s.studentName,
      }));
    } else {
      rawStudents = studentCourses.map((sc: any, index: number) => ({
        studentId: sc.studentDetails?.studentId || index + 1,
        registerNumber: sc.regno,
        studentName: sc.studentDetails?.studentName || `Student ${sc.regno}`,
      }));
    }

    let attendanceMap: Record<string, string> = {};
    if (date && periodNumber) {
      const pastRecords = await PeriodAttendance.findAll({
        where: {
          attendanceDate: date,
          periodNumber,
          courseId,
          sectionId,
        },
      });

      pastRecords.forEach((rec) => {
        const s = rec.status === 'P' ? 'PRESENT' : rec.status === 'OD' ? 'OD' : 'ABSENT';
        attendanceMap[rec.regno] = s;
      });
    }

    return rawStudents.map((s) => {
      const statusFromDb = attendanceMap[s.registerNumber];
      return {
        ...s,
        status: statusFromDb || 'ABSENT',
      };
    });
  }
}
