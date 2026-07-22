/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Course } from '../course.model';
import { Batch } from '../batch.model';
import { CourseBatch } from '../courseBatch.model';
import { CourseBatchStudent } from '../courseBatchStudents.model';
import { Student } from '../student.model';
import { Department } from '../department.model';
import { Semester } from '../semester.model';

export const courseAssociations = () => {
  Department.hasMany(Course, {
    foreignKey: 'department_id',
    as: 'courses',
  });

  Course.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department',
  });

  Semester.hasMany(Course, {
    foreignKey: 'semester_id',
    as: 'courses',
  });

  Course.belongsTo(Semester, {
    foreignKey: 'semester_id',
    as: 'semester',
  });

  Course.belongsToMany(Batch, {
    through: CourseBatch,
    foreignKey: 'course_id',
    otherKey: 'batch_id',
    as: 'batches',
  });

  Batch.belongsToMany(Course, {
    through: CourseBatch,
    foreignKey: 'batch_id',
    otherKey: 'course_id',
    as: 'courses',
  });

  CourseBatch.belongsTo(Course, {
    foreignKey: 'course_id',
    as: 'course',
  });

  CourseBatch.belongsTo(Batch, {
    foreignKey: 'batch_id',
    as: 'batch',
  });

  CourseBatch.belongsToMany(Student, {
    through: CourseBatchStudent,
    foreignKey: 'course_batch_id',
    otherKey: 'student_id',
    as: 'students',
  });

  Student.belongsToMany(CourseBatch, {
    through: CourseBatchStudent,
    foreignKey: 'student_id',
    otherKey: 'course_batch_id',
    as: 'courseBatches',
  });

  CourseBatchStudent.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student',
  });

  Student.hasMany(CourseBatchStudent, {
    foreignKey: 'student_id',
    as: 'courseBatchStudents',
  });
};
