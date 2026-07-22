/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface StudentAttributes {
  id: number;
  name: string;
  roll_no: number;
  email: string;
  phone_no?: string;
  whatsapp_no?: string;
  department_id: number;
  year_id: number;
  tutor_id: number;
  profile_image?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface StudentCreationAttributes
  extends Optional<
    StudentAttributes,
    'id' | 'phone_no' | 'whatsapp_no' | 'profile_image' | 'created_at' | 'updated_at'
  > {}

export class Student
  extends Model<StudentAttributes, StudentCreationAttributes>
  implements StudentAttributes
{
  public id!: number;
  public name!: string;
  public roll_no!: number;
  public email!: string;
  public phone_no!: string;
  public whatsapp_no!: string;
  public department_id!: number;
  public year_id!: number;
  public tutor_id!: number;
  public profile_image!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    roll_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    phone_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    whatsapp_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    year_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'students',
    timestamps: false,
  },
);
