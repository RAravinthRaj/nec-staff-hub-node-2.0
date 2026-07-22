import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DeviceTokenAttributes {
  id: number;
  user_id: number;
  token: string;
  platform: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface DeviceTokenCreationAttributes
  extends Optional<DeviceTokenAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

export class DeviceToken
  extends Model<DeviceTokenAttributes, DeviceTokenCreationAttributes>
  implements DeviceTokenAttributes
{
  public id!: number;
  public user_id!: number;
  public token!: string;
  public platform!: string;
  public is_active!: boolean;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DeviceToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'device_tokens',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id', 'is_active'],
      },
    ],
  },
);
