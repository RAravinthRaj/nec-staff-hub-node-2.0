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
import { normalizeDocuments } from '../../utils/documents';
import { SupabaseStorageService } from '../../services/supabaseStorage.service';
import { NotificationService } from '../../services/notification.service';
import logger from '../../utils/logger';

interface RequestLeaveArgs {
  leave_type: string;
  category_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  documents?: string[];
  force?: boolean;
}

interface Context {
  req: Request;
}

const parseDate = (date: string) => {
  const [day, month, year] = date.split('.');
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();

  if (isNaN(parsedDate)) {
    throw new Error('Invalid date format. Expected DD.MM.YYYY');
  }

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (parsedDate < todayStart) {
    throw new Error('Please Provide Proper Date.');
  }

  return parsedDate;
};

const normalizeLeaveType = (leave_type: string) => {
  const upper = leave_type.toUpperCase();
  if (upper === 'FULL_DAY') return 'full_day' as const;
  if (upper === 'HALF_DAY') return 'half_day' as const;

  const lower = leave_type.toLowerCase();
  if (lower === 'full_day' || lower === 'half_day') return lower as 'full_day' | 'half_day';

  throw new Error(`Invalid leave type: ${leave_type}`);
};

const calculateDays = (start: number, end: number, leaveType: 'full_day' | 'half_day') => {
  if (end < start) {
    throw new Error('End date must be on or after start date.');
  }

  if (leaveType === 'half_day') {
    return 0.5;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((end - start) / msPerDay) + 1;
  return days;
};

export const requestLeave = async (_: any, args: RequestLeaveArgs, context: Context) => {
  try {
    const { leave_type, category_id, start_date, end_date, reason, documents, force } = args;

    if (!reason?.trim()) {
      throw new Error('Reason is required.');
    }

    const authUser = (context.req as any).user;
    if (!authUser?.id) {
      throw new Error('Unauthorized: Invalid or missing token.');
    }

    const staff = await Staff.findOne({ where: { user_id: authUser.id } });
    if (!staff) {
      throw new Error('Staff not found.');
    }

    const category = await LeaveCategory.findByPk(category_id);
    if (!category) {
      throw new Error('Leave category not found.');
    }

    const parsedStart = parseDate(start_date);
    const parsedEnd = parseDate(end_date);
    const normalizedType = normalizeLeaveType(leave_type);
    const normalizedDocuments = normalizeDocuments(documents);
    const uploadedDocuments =
      await SupabaseStorageService.getInstance().uploadBase64Documents(normalizedDocuments);
    const requiredDays = calculateDays(parsedStart, parsedEnd, normalizedType);

    const result = await sequelize.transaction(async (transaction) => {
      let balance = await LeaveBalance.findOne({
        where: { staff_id: staff.id, category_id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!balance) {
        balance = await LeaveBalance.create(
          {
            staff_id: staff.id,
            category_id,
            used_days: 0,
            remaining_days: category.max_days,
          },
          { transaction },
        );
      }

      const remaining = Number(balance.remaining_days);
      const warning =
        remaining <= requiredDays
          ? 'Low leave balance for this category. Submitting will use all remaining leaves.'
          : null;

      if (remaining < requiredDays && !force) {
        return {
          leave: null,
          balance,
          warning,
          requiredDays,
          canSubmit: false,
        };
      }

      const leave = await Leave.create(
        {
          staff_id: staff.id,
          category_id,
          leave_type: normalizedType,
          start_date: parsedStart,
          end_date: parsedEnd,
          status: LeaveStatus.PENDING,
          reason,
          documents: uploadedDocuments,
        },
        { transaction },
      );

      if (remaining < requiredDays) {
        balance.used_days = Number(balance.used_days) + remaining;
        balance.remaining_days = 0;
      } else {
        balance.used_days = Number(balance.used_days) + requiredDays;
        balance.remaining_days = remaining - requiredDays;
      }

      await balance.save({ transaction });

      return { leave, balance, warning, requiredDays, canSubmit: true };
    });

    if (result.leave) {
      const hrUserIds = await NotificationService.getInstance().getHrUserIds();
      const hodUserIds = await NotificationService.getInstance().getHodUserIdsByDepartment(
        staff.department_id,
      );

      await NotificationService.getInstance().createNotifications({
        userIds: hrUserIds,
        title: 'New Leave Request',
        message: `${staff.name} submitted a new leave request for review.`,
        type: 'LEAVE_REQUEST_CREATED',
        entityType: 'leave',
        entityId: result.leave.id,
        data: {
          leave_id: result.leave.id,
          staff_id: staff.id,
        },
      });

      await NotificationService.getInstance().createNotifications({
        userIds: hodUserIds,
        title: 'Leave Intimation',
        message: `${staff.name} submitted a leave request in your department.`,
        type: 'LEAVE_INTIMATION',
        entityType: 'leave',
        entityId: result.leave.id,
        data: {
          leave_id: result.leave.id,
          staff_id: staff.id,
        },
      });
    }

    return {
      success: Boolean(result.leave),
      can_submit: Boolean(result.canSubmit),
      leave_id: result.leave?.id ?? null,
      used_days: Number(result.balance.used_days),
      remaining_days: Number(result.balance.remaining_days),
      required_days: result.requiredDays ?? requiredDays,
      warning: result.warning,
    };
  } catch (err: any) {
    const error = err?.message || 'Unknown error';
    logger.error(`Error in requestLeave: ${error}`);
    throw new Error(error);
  }
};
