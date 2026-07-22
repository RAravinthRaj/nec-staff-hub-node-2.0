/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Leave, LeaveCategory, Staff } from '../../models';
import { LeaveStatus } from '../../config/enum.config';
import { normalizeDocuments } from '../../utils/documents';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

interface GetLeaveRequestsArgs {
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

export const getLeaveRequests = async (_: any, args: GetLeaveRequestsArgs, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const staff = await Staff.findOne({ where: { user_id: authUser.id } });
    if (!staff) {
      throw new Error('Staff not found.');
    }

    const statusFilter = normalizeStatusFilter(args.status);

    const leaves = await Leave.findAll({
      where: {
        staff_id: staff.id,
        withdraw: false,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: [
        {
          model: LeaveCategory,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['start_date', 'DESC']],
    });

    return leaves.map((leave: any) => {
      const data = leave?.toJSON?.() ?? leave;
      return {
        ...data,
        category_name: data?.category?.name ?? null,
        leave_type: normalizeLeaveTypeOut(data?.leave_type),
        status: normalizeLeaveStatusOut(data?.status),
        documents: normalizeDocuments(data?.documents),
        withdraw: Boolean(data?.withdraw ?? false),
      };
    });
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in getLeaveRequests: ${error}`);
    throw new Error(error);
  }
};
