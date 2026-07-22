/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const getCourseBatchStudentsTypeDef = gql`
  type AttendanceStudent {
    student_id: Int!
    rollNumber: Int!
    name: String!
    status: String!
  }

  type AttendanceStudentResponse {
    students: [AttendanceStudent!]!
    totalStudentCount: Int!
    presentCount: Int!
    absentCount: Int!
    odCount: Int!
  }

  extend type Query {
    getCourseBatchStudents(course_batch_id: Int!, period_id: Int!, date: String!): AttendanceStudentResponse!
  }
`;
