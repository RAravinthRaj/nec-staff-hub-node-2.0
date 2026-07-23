/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Role } from './role.model';

export class User extends Model {
  public userId!: number;
  public companyId?: number;
  public departmentId?: number;
  public userNumber!: string;
  public userName?: string;
  public userMail!: string;
  public roleId!: number;
  public password?: string;
  public status!: 'Active' | 'Inactive';
  public profileImage?: string;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public createdBy?: number;
  public updatedBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public role?: Role;
  public staffDetails?: any;
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    userMail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'roleId',
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Active',
    },
    profileImage: {
      type: DataTypes.STRING(500),
      defaultValue: '/uploads/default.jpg',
    },
    resetPasswordToken: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  },
);
