import gql from 'graphql-tag';

export const notificationTypeDef = gql`
  type NotificationItem {
    id: Int!
    title: String!
    message: String!
    type: String!
    entity_type: String
    entity_id: Int
    is_read: Boolean!
    data: String
    created_at: String
    updated_at: String
  }

  type NotificationListResponse {
    notifications: [NotificationItem!]!
    unread_count: Int!
  }

  type NotificationActionResponse {
    success: Boolean!
    notification_id: Int
  }

  type PushTokenResponse {
    success: Boolean!
  }

  extend type Query {
    notifications(filter: String): NotificationListResponse!
  }

  extend type Mutation {
    markNotificationRead(notification_id: Int!): NotificationActionResponse!
    registerPushToken(token: String!, platform: String!): PushTokenResponse!
    unregisterPushToken(token: String!): PushTokenResponse!
  }
`;
