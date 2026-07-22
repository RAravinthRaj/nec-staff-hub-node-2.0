/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface StudentODAttributes {
  id: number;
  student_id: number;
  date: number;
  reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface StudentODCreationAttributes
  extends Optional<StudentODAttributes, 'id' | 'reason' | 'created_at'> {}

export class StudentOD
  extends Model<StudentODAttributes, StudentODCreationAttributes>
  implements StudentODAttributes
{
  public id!: number;
  public student_id!: number;
  public date!: number;
  public reason!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

StudentOD.init(
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

    date: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    tableName: 'student_od',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'date'],
      },
    ],
  },
);
