/*
© 2025 Aravinth Raj R. All rights reserved.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Department } from './department.model';

interface StaffAttributes {
  id: number;
  user_id: number;
  email: string;
  name: string;
  roll_no: string;
  phone_no?: string;
  profile_image?: string;
  date_of_birth?: Date;
  designation: string;
  gender: string;
  department_id: number;
  created_at?: Date;
  updated_at?: Date;
}

interface StaffCreationAttributes
  extends Optional<StaffAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Staff
  extends Model<StaffAttributes, StaffCreationAttributes>
  implements StaffAttributes
{
  public id!: number;
  public user_id!: number;
  public email!: string;
  public name!: string;
  public roll_no!: string;
  public phone_no!: string;
  public profile_image!: string;
  public date_of_birth!: Date;
  public designation!: string;
  public gender!: string;
  public department_id!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Staff.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    roll_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    phone_no: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    designation: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
    },

    profile_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Department,
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
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
    tableName: 'staff',
    timestamps: false,
  },
);
