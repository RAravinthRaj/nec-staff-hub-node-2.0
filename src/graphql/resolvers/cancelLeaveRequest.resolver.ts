/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request } from 'express';
import { sequelize } from '../../config/database';
import { Leave, LeaveBalance, LeaveCategory, Staff } from '../../models';
import { LeaveStatus } from '../../config/enum.config';
import { ValkeyQueueService } from '../../services/valkeyQueue.service';
import { normalizeDocuments } from '../../utils/documents';
import logger from '../../utils/logger';

interface Context {
  req: Request;
}

interface CancelLeaveArgs {
  leave_id: number;
}

const calculateDays = (start: number, end: number, leaveType: string) => {
  if (end < start) {
    throw new Error('End date must be on or after start date.');
  }

  if (String(leaveType).toLowerCase() === 'half_day') {
    return 0.5;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / msPerDay) + 1;
};

export const cancelLeaveRequest = async (_: any, args: CancelLeaveArgs, context: Context) => {
  try {
    const authUser = (context.req as any).user;
    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const staff = await Staff.findOne({ where: { user_id: authUser.id } });
    if (!staff) {
      throw new Error('Staff not found.');
    }

    const cancelledLeave = await sequelize.transaction(async (transaction) => {
      const leave = await Leave.findOne({
        where: {
          id: args.leave_id,
          staff_id: staff.id,
          withdraw: false,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!leave) {
        throw new Error('Leave request not found.');
      }

      if (leave.status !== LeaveStatus.PENDING) {
        throw new Error('Only pending leave requests can be cancelled.');
      }

      const category = await LeaveCategory.findByPk(leave.category_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!category) {
        throw new Error('Leave category not found.');
      }

      let balance = await LeaveBalance.findOne({
        where: {
          staff_id: staff.id,
          category_id: leave.category_id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!balance) {
        balance = await LeaveBalance.create(
          {
            staff_id: staff.id,
            category_id: leave.category_id,
            used_days: 0,
            remaining_days: category.max_days,
          },
          { transaction },
        );
      }

      const documents = normalizeDocuments(leave.documents);
      const restoredDays = Math.min(
        calculateDays(Number(leave.start_date), Number(leave.end_date), leave.leave_type),
        Number(balance.used_days),
      );

      balance.used_days = Math.max(0, Number(balance.used_days) - restoredDays);
      balance.remaining_days = Math.min(
        Number(category.max_days),
        Number(balance.remaining_days) + restoredDays,
      );

      leave.withdraw = true;
      leave.documents = [];

      await Promise.all([balance.save({ transaction }), leave.save({ transaction })]);

      return {
        leaveId: leave.id,
        documents,
      };
    });

    if (cancelledLeave.documents.length) {
      void ValkeyQueueService.getInstance()
        .enqueueLeaveDocumentCleanup({
          leaveId: cancelledLeave.leaveId,
          documents: cancelledLeave.documents,
        })
        .catch((queueError: any) => {
          logger.error(
            `Failed to enqueue leave document cleanup for leave ${cancelledLeave.leaveId}: ${
              queueError?.message || queueError
            }`,
          );
        });
    }

    return {
      success: true,
      leave_id: cancelledLeave.leaveId,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in cancelLeaveRequest: ${error}`);
    throw new Error(error);
  }
};
