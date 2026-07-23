/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Course extends Model {
  public courseId!: number;
  public courseCode!: string;
  public semesterId!: number;
  public courseTitle!: string;
  public category!: string;
  public type!: string;
  public credits!: number;
  public isActive!: string;
}

Course.init(
  {
    courseId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseCode: { type: DataTypes.STRING(20), allowNull: false },
    semesterId: { type: DataTypes.INTEGER, allowNull: false },
    courseTitle: { type: DataTypes.STRING(255), allowNull: false },
    category: {
      type: DataTypes.ENUM('HSMC', 'BSC', 'ESC', 'PEC', 'OEC', 'EEC', 'PCC', 'MC'),
      defaultValue: 'PCC',
    },
    type: {
      type: DataTypes.ENUM('THEORY', 'INTEGRATED', 'PRACTICAL', 'EXPERIENTIAL LEARNING'),
      defaultValue: 'THEORY',
    },
    credits: { type: DataTypes.INTEGER, defaultValue: 3 },
    isActive: { type: DataTypes.ENUM('YES', 'NO'), defaultValue: 'YES' },
  },
  {
    sequelize,
    tableName: 'Course',
    timestamps: true,
  },
);
