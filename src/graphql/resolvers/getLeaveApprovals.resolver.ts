/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Leave, LeaveCategory, Role, Staff, User, Department } from '../../models';
import { LeaveStatus } from '../../config/enum.config';
import { normalizeDocuments } from '../../utils/documents';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

interface GetLeaveApprovalArgs {
  status?: string;
}

const normalizeStatusFilter = (status?: string): LeaveStatus | null => {
  if (!status || status.trim() === '') return null;

  const upper = status.toUpperCase();
  if (upper === 'PENDING') return LeaveStatus.PENDING;
  if (upper === 'APPROVED') return LeaveStatus.APPROVED;
  if (upper === 'DECLINED' || upper === 'REJECTED') return LeaveStatus.DECLINED;

  const lower = status.toLowerCase();
  if (lower === LeaveStatus.PENDING) return LeaveStatus.PENDING;
  if (lower === LeaveStatus.APPROVED) return LeaveStatus.APPROVED;
  if (lower === LeaveStatus.DECLINED) return LeaveStatus.DECLINED;

  throw new Error(`Invalid status filter: ${status}`);
};

const normalizeLeaveTypeOut = (value?: string) => {
  const lower = (value || '').toLowerCase();
  if (lower === 'full_day') return 'FULL_DAY';
  if (lower === 'half_day') return 'HALF_DAY';
  return value;
};

const normalizeLeaveStatusOut = (value?: string) => {
  const lower = (value || '').toLowerCase();
  if (lower === 'pending') return 'PENDING';
  if (lower === 'approved') return 'APPROVED';
  if (lower === 'declined') return 'DECLINED';
  return value;
};

export const getLeaveApprovals = async (_: any, args: GetLeaveApprovalArgs, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const user = await User.findByPk(authUser.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['name'],
        },
      ],
    });

    const isHr = user?.roles?.some((role: any) => role?.name === 'HR');
    if (!isHr) {
      throw new Error('Access denied.');
    }

    const hrStaff = await Staff.findOne({ where: { user_id: authUser.id } });

    const statusFilter = normalizeStatusFilter(args.status);

    const leaves = await Leave.findAll({
      where: {
        withdraw: false,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'name', 'designation', 'gender', 'department_id'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['name', 'abbreviation'],
            },
          ],
        },
        {
          model: LeaveCategory,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['start_date', 'DESC']],
    });

    return leaves
      .filter((leave: any) => (hrStaff ? leave?.staff_id !== hrStaff.id : true))
      .map((leave: any) => {
        const data = leave?.toJSON?.() ?? leave;
        return {
          ...data,
          staff_id: data?.staff_id,
          staff_name: data?.staff?.name ?? '',
          designation: data?.staff?.designation ?? '',
          department_name: data?.staff?.department?.name ?? '',
          department_abbreviation: data?.staff?.department?.abbreviation ?? '',
          gender: data?.staff?.gender ?? '',
          category_name: data?.category?.name ?? null,
          leave_type: normalizeLeaveTypeOut(data?.leave_type),
          status: normalizeLeaveStatusOut(data?.status),
          documents: normalizeDocuments(data?.documents),
        };
      });
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getLeaveApprovals: ${error}`);
    throw new Error(error);
  }
};
