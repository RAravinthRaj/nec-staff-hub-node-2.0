/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PeriodAttributes {
  id: number;
  period_number: string;
  start_time: string;
  end_time: string;
  created_at?: Date;
  updated_at?: Date;
}

interface PeriodCreationAttributes
  extends Optional<PeriodAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Period
  extends Model<PeriodAttributes, PeriodCreationAttributes>
  implements PeriodAttributes
{
  public id!: number;
  public period_number!: string;
  public start_time!: string;
  public end_time!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Period.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    period_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
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
    tableName: 'periods',
    timestamps: false,
  },
);
