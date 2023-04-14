'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Track extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
	  Track.belongsTo(Program);
    }
  }
  Track.init({
    track_id: {
		primaryKey: true,
		type: DataTypes.UUID,
		allowNull: false
	},
    spotify_track_id: {
		type: DataTypes.STRING,
		allowNull: false
	},
	program_id: {
		type: DataTypes.UUID,
		allowNull: false
	},
	program_position: DataTypes.BIGINT,
    track_name: DataTypes.STRING,
	duration_ms: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Track',
  });
  return Track;
};