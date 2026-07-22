/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Staff } from '../staff.model';
import { Department } from '../department.model';
import { Student } from '../student.model';

export const staffAssociations = () => {
  Department.hasMany(Staff, {
    foreignKey: 'department_id',
    as: 'staffMembers',
  });

  Staff.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department',
  });

  Staff.hasMany(Student, {
    foreignKey: 'tutor_id',
    as: 'students',
  });

  Student.belongsTo(Staff, {
    foreignKey: 'tutor_id',
    as: 'tutor',
  });
};
