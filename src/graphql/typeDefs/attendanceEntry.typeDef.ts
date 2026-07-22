/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const attendanceEntryTypeDef = gql`
  input AttendanceEntryStudentInput {
    student_id: Int!
    status: AttendanceStatus!
  }

  type AttendanceEntryResponse {
    success: Boolean!
    totalStudentCount: Int!
    period_id: Int!
    date: String!
  }

  extend type Mutation {
    attendanceEntry(
      period_id: Int!
      date: String!
      students: [AttendanceEntryStudentInput!]!
    ): AttendanceEntryResponse!
  }
`;
