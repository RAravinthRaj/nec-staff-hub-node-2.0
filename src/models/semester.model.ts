/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Semester extends Model {
  public semesterId!: number;
  public batchId!: number;
  public semesterNumber!: number;
  public startDate!: string;
  public endDate!: string;
  public isActive!: string;
}

Semester.init(
  {
    semesterId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    batchId: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    semesterNumber: { type: DataTypes.INTEGER, allowNull: false },
    startDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: '2025-06-01' },
    endDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: '2025-12-31' },
    isActive: { type: DataTypes.ENUM('YES', 'NO'), defaultValue: 'YES' },
  },
  {
    sequelize,
    tableName: 'Semester',
    timestamps: true,
  },
);
