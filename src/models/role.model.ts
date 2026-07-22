/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RoleAttributes {
  id: number;
  name: 'STAFF' | 'HOD' | 'HR' | 'OA';
  created_at?: Date;
  updated_at?: Date;
}

interface RoleCreationAttributes
  extends Optional<RoleAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: 'STAFF' | 'HOD' | 'HR' | 'OA';

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.ENUM('STAFF', 'HOD', 'HR', 'OA'),
      allowNull: false,
      unique: true,
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
    tableName: 'roles',
    timestamps: false,
  },
);
