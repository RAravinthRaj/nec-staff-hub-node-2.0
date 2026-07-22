/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface LeaveBalanceAttributes {
  id: number;
  staff_id: number;
  category_id: number;
  used_days: number;
  remaining_days: number;
  created_at?: Date;
  updated_at?: Date;
}

interface LeaveBalanceCreationAttributes
  extends Optional<LeaveBalanceAttributes, 'id' | 'used_days' | 'remaining_days' | 'created_at' | 'updated_at'> {}

export class LeaveBalance
  extends Model<LeaveBalanceAttributes, LeaveBalanceCreationAttributes>
  implements LeaveBalanceAttributes
{
  public id!: number;
  public staff_id!: number;
  public category_id!: number;
  public used_days!: number;
  public remaining_days!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

LeaveBalance.init(
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

    used_days: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    remaining_days: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'leave_balance',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['staff_id', 'category_id'],
      },
    ],
  },
);
