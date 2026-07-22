/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { LeaveStatus } from '../config/enum.config';

export type LeaveType = 'full_day' | 'half_day';

interface LeaveAttributes {
  id: number;
  staff_id: number;
  category_id: number;
  leave_type: LeaveType;
  start_date: number;
  end_date: number;
  status: LeaveStatus;
  reason?: string;
  comments?: string;
  documents?: string[];
  withdraw: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface LeaveCreationAttributes
  extends Optional<
    LeaveAttributes,
    'id' | 'reason' | 'comments' | 'documents' | 'withdraw' | 'created_at' | 'updated_at'
  > {}

export class Leave
  extends Model<LeaveAttributes, LeaveCreationAttributes>
  implements LeaveAttributes
{
  public id!: number;
  public staff_id!: number;
  public category_id!: number;
  public leave_type!: LeaveType;
  public start_date!: number;
  public end_date!: number;
  public status!: LeaveStatus;
  public reason!: string;
  public comments!: string;
  public documents!: string[];
  public withdraw!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Leave.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    staff_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    leave_type: {
      type: DataTypes.ENUM('full_day', 'half_day'),
      allowNull: false,
    },

    start_date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    end_date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(LeaveStatus)),
      allowNull: false,
      defaultValue: LeaveStatus.PENDING,
    },

    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    comments: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    documents: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    withdraw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'leave_requests',
    timestamps: false,
    indexes: [
      {
        fields: ['staff_id', 'start_date', 'end_date'],
      },
    ],
  },
);
