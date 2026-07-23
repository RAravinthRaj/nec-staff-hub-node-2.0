/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import gql from 'graphql-tag';

export const modelTypeDef = gql`
  type Profile {
    staffId: ID!
    userId: ID!
    name: String!
    email: String!
    mobileNumber: String
    rollNumber: String
    dob: String
    profileImage: String
    designation: String
    department: String
    gender: String
  }
`;
