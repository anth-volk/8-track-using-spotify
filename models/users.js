'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    user_id: {
		type: DataTypes.UUID,
		allowNull: false,
		unique: true
	},
    email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},	
    password_hash: {
		type: DataTypes.STRING,
		allowNull: false
	},
    first_name: {
		type: DataTypes.STRING,
		allowNull: false
	},
    last_name: {
		type: DataTypes.STRING,
		allowNull: false
	}
  }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};