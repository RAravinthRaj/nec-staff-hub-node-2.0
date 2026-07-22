/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { AttendanceStatus } from '../config/enum.config';

interface OAAttendanceAttributes {
  id: number;
  student_id: number;
  marked_by_staff_id: number;
  date: number;
  status: AttendanceStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface OAAttendanceCreationAttributes
  extends Optional<OAAttendanceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class OAAttendance
  extends Model<OAAttendanceAttributes, OAAttendanceCreationAttributes>
  implements OAAttendanceAttributes
{
  public id!: number;
  public student_id!: number;
  public marked_by_staff_id!: number;
  public date!: number;
  public status!: AttendanceStatus;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OAAttendance.init(
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
    marked_by_staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(AttendanceStatus.PRESENT, AttendanceStatus.ABSENT),
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
    tableName: 'oa_attendance',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'date'],
      },
      {
        fields: ['date'],
      },
    ],
  },
);
