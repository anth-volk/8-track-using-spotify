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
	  this.hasMany(models.Track, {
		foreignKey: 'program_id',
		as: 'tracks'
	  });
	 this.belongsTo(models.Cart, {
		foreignKey: 'program_id',
		as: 'program1'
	 });
	 this.belongsTo(models.Cart, {
		foreignKey: 'program_id',
		as: 'program2'
	 });
	 this.belongsTo(models.Cart, {
		foreignKey: 'program_id',
		as: 'program3'
	 });
	 this.belongsTo(models.Cart, {
		foreignKey: 'program_id',
		as: 'program4'
	 });
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