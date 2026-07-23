/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Timetable extends Model {
  public timetableId!: number;
  public courseId!: number;
  public sectionId?: number;
  public dayOfWeek!: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';
  public periodNumber!: number;
  public departmentId!: number;
  public semesterId!: number;
  public isActive!: string;
}

Timetable.init(
  {
    timetableId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    sectionId: { type: DataTypes.INTEGER, allowNull: true },
    dayOfWeek: {
      type: DataTypes.ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'),
      allowNull: false,
    },
    periodNumber: { type: DataTypes.INTEGER, allowNull: false },
    departmentId: { type: DataTypes.INTEGER, allowNull: false },
    semesterId: { type: DataTypes.INTEGER, allowNull: false },
    isActive: { type: DataTypes.ENUM('YES', 'NO'), defaultValue: 'YES' },
  },
  {
    sequelize,
    tableName: 'Timetable',
    timestamps: true,
  },
);
