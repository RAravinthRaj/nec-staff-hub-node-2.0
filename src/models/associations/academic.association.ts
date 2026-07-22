/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Department } from '../department.model';
import { Student } from '../student.model';
import { Year } from '../year.model';

export const academicAssociations = () => {
  Department.hasMany(Student, {
    foreignKey: 'department_id',
    as: 'students',
  });

  Student.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department',
  });

  Year.hasMany(Student, {
    foreignKey: 'year_id',
    as: 'students',
  });

  Student.belongsTo(Year, {
    foreignKey: 'year_id',
    as: 'year',
  });
};
