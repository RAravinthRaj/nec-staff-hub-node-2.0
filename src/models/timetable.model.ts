/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface TimetableAttributes {
  id: number;
  course_batch_id: number;
  period_id: number;
  staff_id: number;
  year_id: number;
  semester_id: number;
  day_of_week: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: Date;
  updated_at?: Date;
}

interface TimetableCreationAttributes
  extends Optional<TimetableAttributes, 'id' | 'status' | 'created_at' | 'updated_at'> {}

export class Timetable
  extends Model<TimetableAttributes, TimetableCreationAttributes>
  implements TimetableAttributes
{
  public id!: number;
  public course_batch_id!: number;
  public period_id!: number;
  public staff_id!: number;
  public year_id!: number;
  public semester_id!: number;
  public day_of_week!: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  public status!: 'ACTIVE' | 'INACTIVE';

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Timetable.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    course_batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    period_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    year_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    day_of_week: {
      type: DataTypes.ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'timetables',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['course_batch_id', 'period_id', 'day_of_week', 'status'],
      },
    ],
  },
);
