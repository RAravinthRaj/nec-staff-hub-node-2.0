/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class StaffDetails extends Model {
  public staffId!: number;
  public Userid!: number;
  public staffNumber?: string;
  public firstName!: string;
  public lastName?: string;
  public personalEmail!: string;
  public officialEmail?: string;
  public mobileNumber?: string;
  public departmentId!: number;
  public designation?: string;
  public user?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StaffDetails.init(
  {
    staffId: {
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
    staffNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    personalEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    officialEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'staff_details',
    timestamps: true,
  },
);
