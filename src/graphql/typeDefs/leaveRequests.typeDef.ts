/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const leaveRequestsTypeDef = gql`
  type LeaveRequest {
    id: Int!
    staff_id: Int!
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
    withdraw: Boolean!
  }

  extend type Query {
    leaveRequests(status: String): [LeaveRequest!]!
  }
`;
