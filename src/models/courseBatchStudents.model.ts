/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CourseBatchStudentAttributes {
  id: number;
  course_batch_id: number;
  student_id: number;
  created_at?: Date;
}

interface CourseBatchStudentCreationAttributes
  extends Optional<CourseBatchStudentAttributes, 'id' | 'created_at'> {}

export class CourseBatchStudent
  extends Model<CourseBatchStudentAttributes, CourseBatchStudentCreationAttributes>
  implements CourseBatchStudentAttributes
{
  public id!: number;
  public course_batch_id!: number;
  public student_id!: number;

  public readonly created_at!: Date;
}

CourseBatchStudent.init(
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

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'course_batch_students',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['course_batch_id', 'student_id'],
      },
    ],
  },
);
