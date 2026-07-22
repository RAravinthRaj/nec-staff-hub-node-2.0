/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CourseAttributes {
  id: number;
  course_code: string;
  course_name: string;
  department_id: number;
  semester_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CourseCreationAttributes
  extends Optional<CourseAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Course
  extends Model<CourseAttributes, CourseCreationAttributes>
  implements CourseAttributes
{
  public id!: number;
  public course_code!: string;
  public course_name!: string;
  public department_id!: number;
  public semester_id!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    course_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    course_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    semester_id: {
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
    tableName: 'courses',
    timestamps: false,
  },
);
