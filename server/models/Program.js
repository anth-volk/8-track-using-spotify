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
		foreignKey: 'program_id'
	  });
	  /*
	  this.belongsTo(models.Cart, {
		as: 'program1',
		as: 'program2',
		as: 'program3',
		as: 'program4'
	  });
	  */
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
	 /*
	 this.belongsTo(models.Cart, {
		as: 'program2',
		foreignKey: 'program2_id'
	 })
	 this.belongsTo(models.Cart, {
		as: 'program3',
		foreignKey: 'program3_id'
	 })
	 this.belongsTo(models.Cart, {
		as: 'program4',
		foreignKey: 'program4_id'
	 })
	 */
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