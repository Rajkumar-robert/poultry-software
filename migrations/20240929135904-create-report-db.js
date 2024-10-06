'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ReportDbs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      NO: {
        type: Sequelize.INTEGER
      },
      DATE: {
        type: Sequelize.DATE
      },
      TIME: {
        type: Sequelize.TIME
      },
      BATCH_NO: {
        type: Sequelize.STRING
      },
      FEED_NAME: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_1: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_1_SET: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_1_ACT: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_2: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_2_SET: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_2_ACT: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_3: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_3_SET: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_3_ACT: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_4: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_4_SET: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_4_ACT: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_5: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_5_SET: {
        type: Sequelize.STRING
      },
      SCALE1_ITEM_5_ACT: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_1: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_1_SET: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_1_ACT: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_2: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_2_SET: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_2_ACT: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_3: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_3_SET: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_3_ACT: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_4: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_4_SET: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_4_ACT: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_5: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_5_SET: {
        type: Sequelize.STRING
      },
      SCALE2_ITEM_5_ACT: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_1: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_1_SET: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_1_ACT: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_2: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_2_SET: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_2_ACT: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_3: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_3_SET: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_3_ACT: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_4: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_4_SET: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_4_ACT: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_5: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_5_SET: {
        type: Sequelize.STRING
      },
      SCALE3_ITEM_5_ACT: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ReportDbs');
  }
};