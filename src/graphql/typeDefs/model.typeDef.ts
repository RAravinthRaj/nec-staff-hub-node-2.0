/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const modelTypeDef = gql`
  type Department {
    id: ID!
    name: String!
    abbreviation: String!
    created_at: String
    updated_at: String
  }

  type Staff {
    id: ID!
    user_id: ID!
    email: String!
    name: String!
    roll_no: String!
    phone_no: String
    profile_image: String
    date_of_birth: String
    designation: String!
    gender: String!
    department: Department
    created_at: String
    updated_at: String
  }

  type Year {
    id: ID!
    year: String!
    created_at: String
    updated_at: String
  }

  type Semester {
    id: ID!
    semester: String!
    created_at: String
    updated_at: String
  }

  type Period {
    id: ID!
    period_number: String!
    start_time: String!
    end_time: String!
    created_at: String
    updated_at: String
  }

  type Batch {
    id: ID!
    batch: String!
    created_at: String
    updated_at: String
  }

  type Course {
    id: ID!
    course_code: String!
    course_name: String!
    created_at: String
    updated_at: String
  }

  type CourseBatch {
    id: ID!
    course: Course!
    batch: Batch!
    created_at: String
    updated_at: String
  }

  type Student {
    id: ID!
    name: String!
    roll_no: Int!
    email: String!
    phone_no: String
    whatsapp_no: String
    profile_image: String
    created_at: String
    updated_at: String
  }

  type Timetable {
    id: ID!
    course_batch_id: Int!
    period_id: Int!
    staff_id: Int!
    year_id: Int!
    semester_id: Int!
    day_of_week: String!
    status: String!

    period: Period!
    courseBatch: CourseBatch!
    semester: Semester!
    year: Year!
    staff: Staff!

    created_at: String
    updated_at: String
  }
`;
