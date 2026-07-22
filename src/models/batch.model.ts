/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BatchAttributes {
  id: number;
  batch: string;
  created_at?: Date;
  updated_at?: Date;
}

interface BatchCreationAttributes
  extends Optional<BatchAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Batch
  extends Model<BatchAttributes, BatchCreationAttributes>
  implements BatchAttributes
{
  public id!: number;
  public batch!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Batch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    batch: {
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
    tableName: 'batch',
    timestamps: false,
  },
);
