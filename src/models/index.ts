/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Role } from './role.model';
import { User } from './user.model';
import { Department } from './department.model';
import { StaffDetails } from './staffDetails.model';
import { StudentDetails } from './studentDetails.model';
import { UserOTP } from './userOTP.model';
import { Course } from './course.model';
import { Section } from './section.model';
import { StaffCourse } from './staffCourse.model';
import { StudentCourse } from './studentCourse.model';
import { Period } from './period.model';
import { Semester } from './semester.model';
import { Timetable } from './timetable.model';
import { PeriodAttendance } from './periodAttendance.model';

// User & Role
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Department
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

StaffDetails.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(StaffDetails, { foreignKey: 'departmentId', as: 'staffMembers' });

// User Profile Details
User.hasOne(StaffDetails, { foreignKey: 'Userid', as: 'staffDetails' });
StaffDetails.belongsTo(User, { foreignKey: 'Userid', as: 'user' });

User.hasOne(StudentDetails, { foreignKey: 'Userid', as: 'studentDetails' });
StudentDetails.belongsTo(User, { foreignKey: 'Userid', as: 'user' });

User.hasOne(UserOTP, { foreignKey: 'userId', as: 'userOtp' });
UserOTP.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Timetable & Academic Associations
Timetable.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
Timetable.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
Timetable.belongsTo(Period, { foreignKey: 'periodNumber', targetKey: 'periodNumber', as: 'period' });
Timetable.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });
Timetable.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

StaffCourse.belongsTo(User, { foreignKey: 'Userid', as: 'user' });
StaffCourse.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
StaffCourse.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });

StudentCourse.belongsTo(StudentDetails, { foreignKey: 'regno', targetKey: 'registerNumber', as: 'studentDetails' });
StudentCourse.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
StudentCourse.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });

import { NotificationModel } from './notification.model';

// PeriodAttendance Associations
PeriodAttendance.belongsTo(StudentDetails, { foreignKey: 'regno', targetKey: 'registerNumber', as: 'studentDetails' });
PeriodAttendance.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });
PeriodAttendance.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
PeriodAttendance.belongsTo(Section, { foreignKey: 'sectionId', as: 'section' });
PeriodAttendance.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

NotificationModel.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(NotificationModel, { foreignKey: 'userId', as: 'notifications' });

export {
  Role,
  User,
  Department,
  StaffDetails,
  StudentDetails,
  UserOTP,
  Course,
  Section,
  StaffCourse,
  StudentCourse,
  Period,
  Semester,
  Timetable,
  PeriodAttendance,
  NotificationModel,
};
