'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
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
    track_name: DataTypes.STRING,
    artists_array: DataTypes.ARRAY(DataTypes.STRING),
	start_time_seconds: DataTypes.BIGINT,
	end_time_seconds: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Track',
  });
  return Track;
};