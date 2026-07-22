/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface YearAttributes {
  id: number;
  year: string;
  created_at?: Date;
  updated_at?: Date;
}

interface YearCreationAttributes
  extends Optional<YearAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Year extends Model<YearAttributes, YearCreationAttributes> implements YearAttributes {
  public id!: number;
  public year!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Year.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    year: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
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
    tableName: 'years',
    timestamps: false,
  },
);
