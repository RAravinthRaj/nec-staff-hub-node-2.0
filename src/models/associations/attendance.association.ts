/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Attendance } from '../attendance.model';
import { Student } from '../student.model';
import { Period } from '../period.model';

export const attendanceAssociations = () => {
  Student.hasMany(Attendance, {
    foreignKey: 'student_id',
    as: 'attendanceRecords',
  });

  Attendance.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student',
  });

  Period.hasMany(Attendance, {
    foreignKey: 'period_id',
    as: 'periodAttendances',
  });

  Attendance.belongsTo(Period, {
    foreignKey: 'period_id',
    as: 'period',
  });
};
