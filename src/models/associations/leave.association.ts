/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Leave } from '../leave.model';
import { LeaveBalance } from '../leaveBalance.model';
import { LeaveCategory } from '../leaveCategory.model';
import { Staff } from '../staff.model';

export const leaveAssociations = () => {
  Staff.hasMany(Leave, {
    foreignKey: 'staff_id',
    as: 'leaves',
  });

  Leave.belongsTo(Staff, {
    foreignKey: 'staff_id',
    as: 'staff',
  });

  LeaveCategory.hasMany(Leave, {
    foreignKey: 'category_id',
    as: 'leaves',
  });

  Leave.belongsTo(LeaveCategory, {
    foreignKey: 'category_id',
    as: 'category',
  });

  Staff.hasMany(LeaveBalance, {
    foreignKey: 'staff_id',
    as: 'leave_balances',
  });

  LeaveBalance.belongsTo(Staff, {
    foreignKey: 'staff_id',
    as: 'staff',
  });

  LeaveCategory.hasMany(LeaveBalance, {
    foreignKey: 'category_id',
    as: 'balances',
  });

  LeaveBalance.belongsTo(LeaveCategory, {
    foreignKey: 'category_id',
    as: 'category',
  });
};
