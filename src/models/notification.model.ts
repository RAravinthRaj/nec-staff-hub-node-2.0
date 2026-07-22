import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface NotificationAttributes {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  entity_type?: string | null;
  entity_id?: number | null;
  is_read: boolean;
  data?: Record<string, any> | null;
  created_at?: Date;
  updated_at?: Date;
}

interface NotificationCreationAttributes
  extends Optional<
    NotificationAttributes,
    'id' | 'entity_type' | 'entity_id' | 'is_read' | 'data' | 'created_at' | 'updated_at'
  > {}

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public user_id!: number;
  public title!: string;
  public message!: string;
  public type!: string;
  public entity_type!: string | null;
  public entity_id!: number | null;
  public is_read!: boolean;
  public data!: Record<string, any> | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Notification.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    data: {
      type: DataTypes.JSON,
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
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id', 'is_read'],
      },
      {
        fields: ['created_at'],
      },
    ],
  },
);
