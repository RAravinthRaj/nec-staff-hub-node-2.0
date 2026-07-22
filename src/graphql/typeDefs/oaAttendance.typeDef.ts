/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const oaAttendanceTypeDef = gql`
  enum OAAttendanceMode {
    DAY
    RANGE
    PERIOD
  }

  type OAFilterOption {
    label: String!
    value: String!
  }

  type OAPeriodOption {
    id: Int!
    label: String!
    period_number: String!
    start_time: String!
    end_time: String!
  }

  type OAAttendanceMetaResponse {
    departments: [OAFilterOption!]!
    years: [OAFilterOption!]!
    periods: [OAPeriodOption!]!
  }

  type OAAttendanceStudent {
    student_id: Int!
    rollNumber: Int!
    name: String!
    status: String!
    present_days: Int!
    absent_days: Int!
    od_days: Int!
    total_days: Int!
  }

  type OAAttendancePagination {
    page: Int!
    page_size: Int!
    total_count: Int!
    total_pages: Int!
  }

  type OAAttendanceSummary {
    total_students: Int!
    present_count: Int!
    absent_count: Int!
    od_count: Int!
    mixed_count: Int!
  }

  type OAAttendanceStudentsResponse {
    students: [OAAttendanceStudent!]!
    pagination: OAAttendancePagination!
    summary: OAAttendanceSummary!
  }

  type ExportOAAttendanceResponse {
    success: Boolean!
    message: String!
  }

  input OAAttendanceStudentInput {
    student_id: Int!
    status: AttendanceStatus!
    reason: String
  }

  type SaveOAAttendanceResponse {
    success: Boolean!
    affected_students: Int!
    affected_dates: Int!
    mode: String!
  }

  extend type Query {
    oaAttendanceMeta: OAAttendanceMetaResponse!
    oaAttendanceStudents(
      department: String!
      year: String!
      start_date: String!
      end_date: String
      mode: OAAttendanceMode!
      period_id: Int
      status: String
      search: String
      page: Int
      page_size: Int
    ): OAAttendanceStudentsResponse!
    oaAttendanceReportStudents(
      department: String!
      year: String!
      start_date: String!
      end_date: String
      mode: OAAttendanceMode!
      status: String
      search: String
      page: Int
      page_size: Int
    ): OAAttendanceStudentsResponse!
  }

  extend type Mutation {
    saveOAAttendance(
      department: String!
      year: String!
      start_date: String!
      end_date: String
      mode: OAAttendanceMode!
      period_id: Int
      students: [OAAttendanceStudentInput!]!
    ): SaveOAAttendanceResponse!
    exportOAAttendanceReport(
      department: String!
      year: String!
      start_date: String!
      end_date: String
      mode: OAAttendanceMode!
      status: String
      search: String
    ): ExportOAAttendanceResponse!
  }
`;
