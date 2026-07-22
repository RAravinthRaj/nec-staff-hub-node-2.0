/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const leaveCategoryTypeDef = gql`
  type LeaveCategory {
    id: Int!
    name: String!
    max_days: Int!
    remaining_days: Float!
  }

  extend type Query {
    leaveCategories: [LeaveCategory!]!
  }
`;
