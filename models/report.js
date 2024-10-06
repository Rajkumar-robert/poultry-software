'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Report.init({
    id:{
      type: DataTypes.INTEGER,  // Use INTEGER for IDs
      primaryKey: true,         // Mark as primary key
      autoIncrement: true       // Automatically increment ID values
    },
    name: DataTypes.STRING,
    date: DataTypes.DATE,
    batch: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Report',
    freezeTableName: true,
  });
  return Report;
};