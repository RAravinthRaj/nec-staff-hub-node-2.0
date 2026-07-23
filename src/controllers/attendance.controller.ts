/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';

export class AttendanceController {
  static async submitAttendance(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const staffId = authUser?.staffId || authUser?.userId || 1;
      const { courseId, sectionId, periodNumber, attendanceDate, records, dayOfWeek, semesterNumber, departmentId } = req.body;

      if (!attendanceDate || !records || !Array.isArray(records)) {
        return res.status(400).json({ message: 'Attendance date and records list are required' });
      }

      const result = await AttendanceService.submitAttendance({
        staffId,
        courseId: Number(courseId || 1),
        sectionId: Number(sectionId || 1),
        periodNumber: Number(periodNumber || 1),
        attendanceDate,
        dayOfWeek,
        semesterNumber,
        departmentId,
        records,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to submit attendance' });
    }
  }

  static async copyAttendance(req: Request, res: Response) {
    try {
      const { targetDate, targetPeriodNumber, currentCourseId, currentSectionId } = req.query;

      if (!targetDate || !targetPeriodNumber) {
        return res.status(400).json({ message: 'Target date and period number are required' });
      }

      const result = await AttendanceService.copyAttendance({
        targetDate: String(targetDate),
        targetPeriodNumber: Number(targetPeriodNumber),
        currentCourseId: Number(currentCourseId || 1),
        currentSectionId: Number(currentSectionId || 1),
      });

      return res.status(200).json({ students: result });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to copy attendance' });
    }
  }

  static async filterAttendanceRecords(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const result = await AttendanceService.filterAttendanceRecords(authUser, req.query);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to filter attendance records' });
    }
  }
}
