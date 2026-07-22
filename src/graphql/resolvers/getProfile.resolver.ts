/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Staff, Department } from '../../models';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

export const getProfile = async (_: any, __: any, context: Context) => {
  try {
    const authUser = (context.req as any).user;

    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const staff = await Staff.findOne({
      where: { user_id: authUser.id },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'abbreviation'],
        },
      ],
    });

    if (!staff) {
      throw new Error('Profile not found.');
    }

    return staff;
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getProfile: ${error}`);
    throw new Error(error);
  }
};
