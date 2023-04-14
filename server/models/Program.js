'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Program extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  Program.hasMany(Track);
	  Program.belongsTo(Cart);
    }
  }
  Program.init({
    program_id: {
		primaryKey: true,
		type: DataTypes.UUID,
		allowNull: false
	},
	program_length_ms: DataTypes.BIGINT,
	intra_track_fade_length_ms: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Program',
  });
  return Program;
};