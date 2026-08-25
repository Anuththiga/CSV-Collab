import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

class Post extends Model {
  declare id: number;
  declare postId: number;
  declare name: string;
  declare email: string;
  declare pendingData: string | null;
  declare version: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare updatedBy: string;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pendingData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    updatedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: true,
  }
);

export default Post;