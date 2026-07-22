/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Timetable } from '../timetable.model';
import { CourseBatch } from '../courseBatch.model';
import { Staff } from '../staff.model';
import { Period } from '../period.model';
import { Year } from '../year.model';
import { Semester } from '../semester.model';

export const timetableAssociations = () => {
  CourseBatch.hasMany(Timetable, {
    foreignKey: 'course_batch_id',
    as: 'timetables',
  });

  Timetable.belongsTo(CourseBatch, {
    foreignKey: 'course_batch_id',
    as: 'courseBatch',
  });

  Staff.hasMany(Timetable, {
    foreignKey: 'staff_id',
    as: 'timetables',
  });

  Timetable.belongsTo(Staff, {
    foreignKey: 'staff_id',
    as: 'staff',
  });

  Period.hasMany(Timetable, {
    foreignKey: 'period_id',
    as: 'timetables',
  });

  Timetable.belongsTo(Period, {
    foreignKey: 'period_id',
    as: 'period',
  });

  Year.hasMany(Timetable, {
    foreignKey: 'year_id',
    as: 'timetables',
  });

  Timetable.belongsTo(Year, {
    foreignKey: 'year_id',
    as: 'year',
  });

  Semester.hasMany(Timetable, {
    foreignKey: 'semester_id',
    as: 'timetables',
  });

  Timetable.belongsTo(Semester, {
    foreignKey: 'semester_id',
    as: 'semester',
  });
};
