/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const leaveIntimationTypeDef = gql`
  type LeaveIntimation {
    id: Int!
    staff_id: Int!
    staff_name: String!
    designation: String!
    department_name: String!
    department_abbreviation: String!
    gender: String!
    category_id: Int!
    category_name: String
    leave_type: LeaveType!
    start_date: String!
    end_date: String!
    status: LeaveStatus!
    reason: String
    comments: String
    documents: [String!]
    created_at: String
    updated_at: String
  }

  extend type Query {
    leaveIntimations(status: String): [LeaveIntimation!]!
  }
`;
