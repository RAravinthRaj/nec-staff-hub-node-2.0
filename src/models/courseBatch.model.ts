/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CourseBatchAttributes {
  id: number;
  course_id: number;
  batch_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseBatchCreationAttributes
  extends Optional<CourseBatchAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class CourseBatch
  extends Model<CourseBatchAttributes, CourseBatchCreationAttributes>
  implements CourseBatchAttributes
{
  public id!: number;
  public course_id!: number;
  public batch_id!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseBatch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    batch_id: {
      type: DataTypes.INTEGER,
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
    tableName: 'course_batches',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['course_id', 'batch_id'],
      },
    ],
  },
);
