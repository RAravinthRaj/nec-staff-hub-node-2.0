/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Request, Response } from 'express';
import { TimetableService } from '../services/timetable.service';

export class TimetableController {
  static async getTimetable(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const userId = authUser?.userId || authUser?.id || 1;
      const dayOfWeek = (req.query.day as string) || 'MON';

      const schedules = await TimetableService.getStaffTimetable(userId, dayOfWeek);
      return res.status(200).json({ schedules });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to fetch timetable' });
    }
  }

  static async getStudentsForAttendance(req: Request, res: Response) {
    try {
      const courseId = Number(req.query.courseId || 1);
      const sectionId = Number(req.query.sectionId || 1);
      const periodNumber = req.query.periodNumber ? Number(req.query.periodNumber) : undefined;
      const date = req.query.date ? String(req.query.date) : undefined;

      const students = await TimetableService.getStudentsForAttendance(courseId, sectionId, date, periodNumber);
      return res.status(200).json({ students });
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to fetch student attendance list' });
    }
  }
}
