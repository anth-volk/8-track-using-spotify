'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class carts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  
    }
  }
  carts.init({
    cart_id: {
		type: DataTypes.UUID,
		allowNull: false,
		unique: true
	},
    user_id: {
		type: DataTypes.UUID,
		allowNull: false
	},
    cart_name: {
		type: DataTypes.STRING,
		allowNull: false
	},
    track1_link: DataTypes.STRING,
    track1_fade_out_seconds: DataTypes.INTEGER,
    track2_link: DataTypes.STRING,
    track2_fade_out_seconds: DataTypes.INTEGER,
    track3_link: DataTypes.STRING,
    track3_fade_out_seconds: DataTypes.INTEGER,
    track4_link: DataTypes.STRING,
    track4_fade_out_seconds: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'carts',
  });
  return carts;
};