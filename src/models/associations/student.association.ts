/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Student } from '../student.model';
import { StudentOD } from '../od.model';

export const studentAssociations = () => {
  Student.hasMany(StudentOD, {
    foreignKey: 'student_id',
    as: 'odRecords',
  });

  StudentOD.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student',
  });
};
