/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { User } from './user.model';
import { Role } from './role.model';
import { UserRole } from './userRole.model';
import { Staff } from './staff.model';
import { Department } from './department.model';
import { Period } from './period.model';
import { Semester } from './semester.model';
import { Year } from './year.model';
import { Student } from './student.model';
import { Batch } from './batch.model';
import { Course } from './course.model';
import { CourseBatch } from './courseBatch.model';
import { CourseBatchStudent } from './courseBatchStudents.model';
import { Timetable } from './timetable.model';
import { StudentOD } from './od.model';
import { Attendance } from './attendance.model';
import { OAAttendance } from './oaAttendance.model';
import { Leave } from './leave.model';
import { LeaveCategory } from './leaveCategory.model';
import { LeaveBalance } from './leaveBalance.model';
import { Notification } from './notification.model';
import { DeviceToken } from './deviceToken.model';

import {
  userAssociations,
  staffAssociations,
  academicAssociations,
  courseAssociations,
  timetableAssociations,
  studentAssociations,
  leaveAssociations,
  notificationAssociations,
} from './associations';

const applyAssociations = () => {
  userAssociations();
  staffAssociations();
  academicAssociations();
  courseAssociations();
  timetableAssociations();
  studentAssociations();
  leaveAssociations();
  notificationAssociations();
};

applyAssociations();

export {
  User,
  Role,
  UserRole,
  Staff,
  Department,
  Period,
  Semester,
  Year,
  Student,
  Batch,
  Course,
  CourseBatch,
  CourseBatchStudent,
  Timetable,
  StudentOD,
  Attendance,
  OAAttendance,
  Leave,
  LeaveCategory,
  LeaveBalance,
  Notification,
  DeviceToken,
};
