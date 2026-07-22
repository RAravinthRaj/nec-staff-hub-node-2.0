/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { User } from '../user.model';
import { Role } from '../role.model';
import { UserRole } from '../userRole.model';
import { Staff } from '../staff.model';

export const userAssociations = () => {
  User.belongsToMany(Role, {
    through: { model: UserRole, unique: false },
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles',
  });

  Role.belongsToMany(User, {
    through: { model: UserRole, unique: false },
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users',
  });

  User.hasOne(Staff, {
    foreignKey: 'user_id',
    as: 'staffProfile',
  });

  Staff.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};
