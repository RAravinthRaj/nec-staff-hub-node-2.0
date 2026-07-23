/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class StudentCourse extends Model {
  public studentCourseId!: number;
  public regno!: string;
  public courseId!: number;
  public sectionId!: number;
}

StudentCourse.init(
  {
    studentCourseId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    regno: { type: DataTypes.STRING(50), allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    sectionId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'StudentCourse',
    timestamps: true,
  },
);
