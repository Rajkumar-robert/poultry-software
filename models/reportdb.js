'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReportDb extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ReportDb.init({
    NO: DataTypes.INTEGER,
    DATE:{
      type: DataTypes.DATEONLY, 
  },
    TIME: DataTypes.TIME,
    BATCH_NO: DataTypes.STRING,
    FEED_NAME: DataTypes.STRING,
    SCALE1_ITEM_1: DataTypes.STRING,
    SCALE1_ITEM_1_SET: DataTypes.STRING,
    SCALE1_ITEM_1_ACT: DataTypes.STRING,
    SCALE1_ITEM_2: DataTypes.STRING,
    SCALE1_ITEM_2_SET: DataTypes.STRING,
    SCALE1_ITEM_2_ACT: DataTypes.STRING,
    SCALE1_ITEM_3: DataTypes.STRING,
    SCALE1_ITEM_3_SET: DataTypes.STRING,
    SCALE1_ITEM_3_ACT: DataTypes.STRING,
    SCALE1_ITEM_4: DataTypes.STRING,
    SCALE1_ITEM_4_SET: DataTypes.STRING,
    SCALE1_ITEM_4_ACT: DataTypes.STRING,
    SCALE1_ITEM_5: DataTypes.STRING,
    SCALE1_ITEM_5_SET: DataTypes.STRING,
    SCALE1_ITEM_5_ACT: DataTypes.STRING,
    SCALE2_ITEM_1: DataTypes.STRING,
    SCALE2_ITEM_1_SET: DataTypes.STRING,
    SCALE2_ITEM_1_ACT: DataTypes.STRING,
    SCALE2_ITEM_2: DataTypes.STRING,
    SCALE2_ITEM_2_SET: DataTypes.STRING,
    SCALE2_ITEM_2_ACT: DataTypes.STRING,
    SCALE2_ITEM_3: DataTypes.STRING,
    SCALE2_ITEM_3_SET: DataTypes.STRING,
    SCALE2_ITEM_3_ACT: DataTypes.STRING,
    SCALE2_ITEM_4: DataTypes.STRING,
    SCALE2_ITEM_4_SET: DataTypes.STRING,
    SCALE2_ITEM_4_ACT: DataTypes.STRING,
    SCALE2_ITEM_5: DataTypes.STRING,
    SCALE2_ITEM_5_SET: DataTypes.STRING,
    SCALE2_ITEM_5_ACT: DataTypes.STRING,
    SCALE3_ITEM_1: DataTypes.STRING,
    SCALE3_ITEM_1_SET: DataTypes.STRING,
    SCALE3_ITEM_1_ACT: DataTypes.STRING,
    SCALE3_ITEM_2: DataTypes.STRING,
    SCALE3_ITEM_2_SET: DataTypes.STRING,
    SCALE3_ITEM_2_ACT: DataTypes.STRING,
    SCALE3_ITEM_3: DataTypes.STRING,
    SCALE3_ITEM_3_SET: DataTypes.STRING,
    SCALE3_ITEM_3_ACT: DataTypes.STRING,
    SCALE3_ITEM_4: DataTypes.STRING,
    SCALE3_ITEM_4_SET: DataTypes.STRING,
    SCALE3_ITEM_4_ACT: DataTypes.STRING,
    SCALE3_ITEM_5: DataTypes.STRING,
    SCALE3_ITEM_5_SET: DataTypes.STRING,
    SCALE3_ITEM_5_ACT: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ReportDb',
    freezeTableName: true,
  });
  return ReportDb;
};