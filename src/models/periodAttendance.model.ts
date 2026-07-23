/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class PeriodAttendance extends Model {
  public periodAttendanceId!: number;
  public regno!: string;
  public staffId!: number;
  public courseId!: number;
  public sectionId!: number;
  public semesterNumber!: number;
  public dayOfWeek!: string;
  public periodNumber!: number;
  public attendanceDate!: string;
  public status!: 'P' | 'A' | 'OD';
  public departmentId!: number;
  public updatedBy!: string;
  public studentDetails?: any;
}

PeriodAttendance.init(
  {
    periodAttendanceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    regno: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semesterNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    dayOfWeek: {
      type: DataTypes.ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'),
      allowNull: false,
    },
    periodNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attendanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('P', 'A', 'OD'),
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    updatedBy: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: 'Staff',
    },
  },
  {
    sequelize,
    tableName: 'PeriodAttendance',
    timestamps: false,
  },
);
