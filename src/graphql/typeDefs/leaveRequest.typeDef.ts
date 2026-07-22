/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const leaveRequestTypeDef = gql`
  type LeaveRequestResponse {
    success: Boolean!
    can_submit: Boolean!
    leave_id: Int
    used_days: Float!
    remaining_days: Float!
    required_days: Float
    warning: String
  }

  type CancelLeaveResponse {
    success: Boolean!
    leave_id: Int!
  }

  extend type Mutation {
    requestLeave(
      leave_type: LeaveType!
      category_id: Int!
      start_date: String!
      end_date: String!
      reason: String!
      documents: [String!]
      force: Boolean
    ): LeaveRequestResponse!

    cancelLeaveRequest(leave_id: Int!): CancelLeaveResponse!
  }
`;
