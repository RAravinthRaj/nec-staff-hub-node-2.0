/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Department extends Model {
  public departmentId!: number;
  public departmentName!: string;
  public departmentCode!: string;
  public status!: 'Active' | 'Inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
  {
    departmentId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    departmentName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    departmentCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Active',
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: true,
  },
);
