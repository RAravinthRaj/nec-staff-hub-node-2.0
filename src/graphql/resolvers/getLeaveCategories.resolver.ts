/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { LeaveBalance, LeaveCategory, Staff } from '../../models';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

export const getLeaveCategories = async (_: any, __: any, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const staff = await Staff.findOne({ where: { user_id: authUser.id } });
    if (!staff) {
      throw new Error('Staff not found.');
    }

    const categories = await LeaveCategory.findAll({
      include: [
        {
          model: LeaveBalance,
          as: 'balances',
          where: { staff_id: staff.id },
          required: false,
          attributes: ['remaining_days'],
        },
      ],
      order: [['name', 'ASC']],
    });

    return categories.map((category: any) => {
      const data = category?.toJSON?.() ?? category;
      const balance = data?.balances?.[0];
      const remaining = balance?.remaining_days ?? data?.max_days ?? 0;
      return {
        ...data,
        remaining_days: Number(remaining),
      };
    });
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getLeaveCategories: ${error}`);
    throw new Error(error);
  }
};
