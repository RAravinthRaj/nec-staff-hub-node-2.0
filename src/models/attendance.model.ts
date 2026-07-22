/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { AttendanceStatus } from '../config/enum.config';

interface AttendanceAttributes {
  id: number;
  student_id: number;
  period_id: number;
  date: number;
  status: AttendanceStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface AttendanceCreationAttributes
  extends Optional<AttendanceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Attendance
  extends Model<AttendanceAttributes, AttendanceCreationAttributes>
  implements AttendanceAttributes
{
  public id!: number;
  public student_id!: number;
  public period_id!: number;
  public date!: number;
  public status!: AttendanceStatus;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Attendance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    period_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(AttendanceStatus)),
      allowNull: false,
      defaultValue: AttendanceStatus.ABSENT,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'attendance',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'period_id', 'date'],
      },
    ],
  },
);
