/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Attendance, CourseBatchStudent, Student, StudentOD } from '../../models';
import { Op } from 'sequelize';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

export const getCourseBatchStudents = async (_: any, args: any, context: Context) => {
  try {
    const authUser = (context.req as any).user;

    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const { course_batch_id, date, period_id } = args;

    const [day, month, year] = date.split('.');
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();

    if (isNaN(parsedDate)) {
      throw new Error('Invalid date format. Expected DD.MM.YYYY');
    }

    const studentsData = await CourseBatchStudent.findAll({
      where: { course_batch_id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'roll_no', 'name'],
        },
      ],
      order: [[{ model: Student, as: 'student' }, 'roll_no', 'ASC']],
    });

    const studentIds = studentsData.map((s: any) => s.student?.id).filter(Boolean);

    const odRecords = await StudentOD.findAll({
      where: {
        student_id: {
          [Op.in]: studentIds,
        },
        date: parsedDate,
      },
    });

    const odSet = new Set(odRecords.map((o: any) => o.student_id));

    const attendanceRecords = await Attendance.findAll({
      where: {
        student_id: {
          [Op.in]: studentIds,
        },
        period_id,
        date: parsedDate,
      },
    });

    const attendanceStatusMap = new Map<number, string>(
      attendanceRecords.map((a: any) => [a.student_id, a.status]),
    );

    const students = studentsData.map((s: any) => {
      const student = s.student;

      let status = 'absent';

      if (odSet.has(student.id)) {
        status = 'onDuty';
      } else if (attendanceStatusMap.has(student.id)) {
        const raw = attendanceStatusMap.get(student.id);
        if (raw === 'onduty') status = 'onDuty';
        else if (raw === 'present') status = 'present';
        else status = 'absent';
      }

      return {
        student_id: student.id,
        rollNumber: student.roll_no,
        name: student.name,
        status,
      };
    });

    const totalStudentCount = students.length;
    const odCount = students.filter((s) => s.status === 'onDuty').length;
    const absentCount = students.filter((s) => s.status === 'absent').length;
    const presentCount = students.filter((s) => s.status === 'present').length;

    return {
      students,
      totalStudentCount,
      presentCount,
      absentCount,
      odCount,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getCourseBatchStudents: ${error}`);
    throw new Error(error);
  }
};
