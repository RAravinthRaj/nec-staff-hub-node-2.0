/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface LeaveCategoryAttributes {
  id: number;
  name: string;
  max_days: number;
  created_at?: Date;
  updated_at?: Date;
}

interface LeaveCategoryCreationAttributes
  extends Optional<LeaveCategoryAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class LeaveCategory
  extends Model<LeaveCategoryAttributes, LeaveCategoryCreationAttributes>
  implements LeaveCategoryAttributes
{
  public id!: number;
  public name!: string;
  public max_days!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

LeaveCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    max_days: {
      type: DataTypes.INTEGER,
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
    tableName: 'leave_category',
    timestamps: false,
  },
);
