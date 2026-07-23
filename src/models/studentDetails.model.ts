/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class StudentDetails extends Model {
  public studentId!: number;
  public Userid!: number;
  public studentName!: string;
  public registerNumber!: string;
  public departmentId!: number;
  public batch?: number;
  public course?: string;
  public semester?: string;
  public staffId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StudentDetails.init(
  {
    studentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'userId',
      },
    },
    studentName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    registerNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batch: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    course: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    semester: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'student_details',
    timestamps: true,
  },
);
