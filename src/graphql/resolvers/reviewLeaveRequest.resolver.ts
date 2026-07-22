/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { Leave, Role, Staff, User } from '../../models';
import { LeaveStatus } from '../../config/enum.config';
import { NotificationService } from '../../services/notification.service';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

interface ReviewLeaveArgs {
  leave_id: number;
  status: string;
  comments: string;
}

const normalizeStatus = (status: string): LeaveStatus => {
  const upper = status.toUpperCase();
  if (upper === 'APPROVED') return LeaveStatus.APPROVED;
  if (upper === 'DECLINED' || upper === 'REJECTED') return LeaveStatus.DECLINED;
  if (upper === 'PENDING') return LeaveStatus.PENDING;

  const lower = status.toLowerCase();
  if (lower === LeaveStatus.APPROVED) return LeaveStatus.APPROVED;
  if (lower === LeaveStatus.DECLINED) return LeaveStatus.DECLINED;
  if (lower === LeaveStatus.PENDING) return LeaveStatus.PENDING;

  throw new Error(`Invalid status: ${status}`);
};

export const reviewLeaveRequest = async (_: any, args: ReviewLeaveArgs, context: Context) => {
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

    const leave = await Leave.findByPk(args.leave_id);
    if (!leave) {
      throw new Error('Leave request not found.');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new Error('Only pending leave requests can be reviewed.');
    }

    const nextStatus = normalizeStatus(args.status);
    leave.status = nextStatus;
    leave.comments = args.comments;
    await leave.save();

    const staff = await Staff.findByPk(leave.staff_id);
    if (staff?.user_id) {
      await NotificationService.getInstance().createNotifications({
        userIds: [Number(staff.user_id)],
        title:
          nextStatus === LeaveStatus.APPROVED
            ? 'Leave Request Approved'
            : 'Leave Request Rejected',
        message:
          nextStatus === LeaveStatus.APPROVED
            ? 'Your leave request has been approved by HR.'
            : 'Your leave request has been rejected by HR.',
        type:
          nextStatus === LeaveStatus.APPROVED
            ? 'LEAVE_REQUEST_APPROVED'
            : 'LEAVE_REQUEST_REJECTED',
        entityType: 'leave',
        entityId: leave.id,
        data: {
          leave_id: leave.id,
          status: nextStatus,
        },
      });
    }

    return {
      success: true,
      leave_id: leave.id,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in reviewLeaveRequest: ${error}`);
    throw new Error(error);
  }
};
