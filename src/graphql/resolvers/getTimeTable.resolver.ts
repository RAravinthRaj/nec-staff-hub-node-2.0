/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Staff, Timetable, CourseBatch, Course, Batch, Period, Semester, Year } from '../../models';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

export const getTimetable = async (_: any, { day }: { day: string }, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    if (!day || day === 'SUN') {
      return [];
    }

    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    if (!validDays.includes(day)) {
      throw new Error(`Invalid day provided: ${day}`);
    }

    const staff = await Staff.findOne({
      where: { user_id: authUser.id },
    });

    if (!staff) {
      throw new Error('Staff not found.');
    }

    const timetable = await Timetable.findAll({
      where: {
        staff_id: staff.id,
        day_of_week: day,
        status: 'ACTIVE',
      },
      include: [
        {
          model: CourseBatch,
          as: 'courseBatch',
          include: [
            {
              model: Course,
              as: 'course',
            },
            {
              model: Batch,
              as: 'batch',
            },
          ],
        },
        {
          model: Period,
          as: 'period',
        },
        {
          model: Semester,
          as: 'semester',
        },
        {
          model: Year,
          as: 'year',
        },
        {
          model: Staff,
          as: 'staff',
        },
      ],
      order: [[{ model: Period, as: 'period' }, 'start_time', 'ASC']],
    });

    return timetable;
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getTimetable: ${error}`);
    throw new Error(error);
  }
};
