import { User } from '../user.model';
import { Notification } from '../notification.model';
import { DeviceToken } from '../deviceToken.model';

export const notificationAssociations = () => {
  User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications',
  });

  Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });

  User.hasMany(DeviceToken, {
    foreignKey: 'user_id',
    as: 'deviceTokens',
  });

  DeviceToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
  });
};
