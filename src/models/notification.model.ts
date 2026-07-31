/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class NotificationModel extends Model {
  public notificationId!: number;
  public userId!: number;
  public title!: string;
  public message!: string;
  public type!: string;
  public isRead!: boolean;
  public metadata?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificationModel.init(
  {
    notificationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('ATTENDANCE', 'SCHEDULE', 'REPORT', 'ABSENCE', 'REMINDER'),
      defaultValue: 'REMINDER',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
  },
);
