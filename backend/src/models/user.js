import sequelize from '../database.js';  // Importer l'instance de sequelize
import { DataTypes } from 'sequelize';

const User = sequelize.define('user', {
  iduser: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  niveau: {
    type: DataTypes.STRING,
    allowNull: false
  },
  secretCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user',  // Nom de la table
  timestamps: true    // Gestion automatique de createdAt et updatedAt
});

export { User };
