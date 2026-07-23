/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { User, StaffDetails, Department } from '../../models';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

export const getProfile = async (_: any, __: any, context: Context) => {
  try {
    const authUser = (context.req as any).user;

    if (!authUser) {
      throw new Error('Unauthorized: Missing or invalid JWT token.');
    }

    const staffId = authUser.staffId;
    const userId = authUser.userId || authUser.id;

    let staff: any = null;

    if (staffId) {
      staff = await StaffDetails.findOne({
        where: { staffId },
        include: [
          { model: User, as: 'user' },
          { model: Department, as: 'department' },
        ],
      });
    }

    if (!staff && userId) {
      staff = await StaffDetails.findOne({
        where: { Userid: userId },
        include: [
          { model: User, as: 'user' },
          { model: Department, as: 'department' },
        ],
      });
    }

    const user = staff?.user || (userId ? await User.findByPk(userId) : null);

    if (!staff && !user) {
      throw new Error('Staff profile details not found');
    }

    const name = staff
      ? `${staff.firstName || ''} ${staff.lastName || ''}`.trim()
      : user?.userName || 'Staff Member';

    const email = staff?.officialEmail || staff?.personalEmail || user?.userMail || '';
    const mobileNumber = staff?.mobileNumber || '';
    const rollNumber = staff?.staffNumber || user?.userNumber || '';
    const dob = staff?.getDataValue('dateOfBirth') || staff?.getDataValue('DOB') || null;
    const profileImage = user?.profileImage || null;
    
    const baseDesignation = staff?.designation || 'Assistant Professor';
    const deptName = staff?.department?.departmentName || 'Computer Science and Engineering';
    const designation = `${baseDesignation}, ${deptName}`;
    const gender = staff?.getDataValue('gender') || 'Male';

    return {
      staffId: staff?.staffId || userId || 1,
      userId: user?.userId || userId || 1,
      name,
      email,
      mobileNumber,
      rollNumber,
      dob: dob ? String(dob) : null,
      profileImage,
      designation,
      department: deptName,
      gender,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getProfile: ${error}`);
    throw new Error(error);
  }
};
