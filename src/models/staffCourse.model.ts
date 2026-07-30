/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class StaffCourse extends Model {
  public staffCourseId!: number;
  public Userid!: number;
  public courseId!: number;
  public sectionId!: number;
  public departmentId!: number;
}

StaffCourse.init(
  {
    staffCourseId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Userid: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    sectionId: { type: DataTypes.INTEGER, allowNull: false },
    departmentId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: 'staffcourse',
    timestamps: true,
  },
);
