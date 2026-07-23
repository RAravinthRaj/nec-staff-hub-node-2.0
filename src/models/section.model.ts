/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Section extends Model {
  public sectionId!: number;
  public courseId!: number;
  public sectionName!: string;
  public capacity!: number;
  public isActive!: string;
}

Section.init(
  {
    sectionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    sectionName: { type: DataTypes.STRING(10), allowNull: false },
    capacity: { type: DataTypes.INTEGER, defaultValue: 60 },
    isActive: { type: DataTypes.ENUM('YES', 'NO'), defaultValue: 'YES' },
  },
  {
    sequelize,
    tableName: 'Section',
    timestamps: true,
  },
);
