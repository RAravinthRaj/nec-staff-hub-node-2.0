/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { mergeTypeDefs } from '@graphql-tools/merge';
import {
  getProfileTypeDef,
  modelTypeDef,
  baseTypeDef,
  enumTypeDef,
  getTimeTableTypeDef,
  getCourseBatchStudentsTypeDef,
  attendanceEntryTypeDef,
  oaAttendanceTypeDef,
  leaveRequestTypeDef,
  leaveCategoryTypeDef,
  leaveRequestsTypeDef,
  leaveIntimationTypeDef,
  leaveApprovalTypeDef,
  notificationTypeDef,
} from './typeDefs';
import {
  getProfile,
  getTimetable,
  getCourseBatchStudents,
  attendanceEntry,
  oaAttendanceMeta,
  oaAttendanceStudents,
  requestLeave,
  getLeaveCategories,
  getLeaveRequests,
  cancelLeaveRequest,
  getLeaveIntimations,
  getLeaveApprovals,
  reviewLeaveRequest,
  saveOAAttendance,
  oaAttendanceReportStudents,
  exportOAAttendanceReport,
  notifications,
  markNotificationRead,
  registerPushToken,
} from './resolvers';

export const typeDefs = mergeTypeDefs([
  baseTypeDef,
  enumTypeDef,
  modelTypeDef,
  getProfileTypeDef,
  getTimeTableTypeDef,
  getCourseBatchStudentsTypeDef,
  attendanceEntryTypeDef,
  oaAttendanceTypeDef,
  leaveRequestTypeDef,
  leaveCategoryTypeDef,
  leaveRequestsTypeDef,
  leaveIntimationTypeDef,
  leaveApprovalTypeDef,
  notificationTypeDef,
]);

export const resolvers = {
  Query: {
    getProfile,
    getTimetable,
    getCourseBatchStudents,
    oaAttendanceMeta,
    oaAttendanceStudents,
    oaAttendanceReportStudents,
    leaveCategories: getLeaveCategories,
    leaveRequests: getLeaveRequests,
    leaveIntimations: getLeaveIntimations,
    leaveApprovals: getLeaveApprovals,
    notifications,
  },
  Mutation: {
    attendanceEntry,
    saveOAAttendance,
    exportOAAttendanceReport,
    requestLeave,
    cancelLeaveRequest,
    reviewLeaveRequest,
    markNotificationRead,
    registerPushToken,
  },
};
