const { DataTypes } = require('sequelize');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../models');
const { ipcMain } = require('electron');

const addNewRecords = () => {
    ipcMain.on('add-new-records', async (event, data) => {
        const Report = require('../models/reportdb')(sequelize, DataTypes);

        try {
            // Insert each record from the CSV into the database
            for (const report of data) {
                // console.log('Adding record:', report);
                const {
                    NO, TIME, 'BATCH NO': BATCH_NO, 'FEED NAME': FEED_NAME,
                    SCALE1_ITEM_1, SCALE1_ITEM_1_SET, SCALE1_ITEM_1_ACT,
                    SCALE1_ITEM_2, SCALE1_ITEM_2_SET, SCALE1_ITEM_2_ACT,
                    SCALE1_ITEM_3, SCALE1_ITEM_3_SET, SCALE1_ITEM_3_ACT,
                    SCALE1_ITEM_4, SCALE1_ITEM_4_SET, SCALE1_ITEM_4_ACT,
                    SCALE1_ITEM_5, SCALE1_ITEM_5_SET, SCALE1_ITEM_5_ACT,
                    SCALE2_ITEM_1, SCALE2_ITEM_1_SET, SCALE2_ITEM_1_ACT,
                    SCALE2_ITEM_2, SCALE2_ITEM_2_SET, SCALE2_ITEM_2_ACT,
                    SCALE2_ITEM_3, SCALE2_ITEM_3_SET, SCALE2_ITEM_3_ACT,
                    SCALE2_ITEM_4, SCALE2_ITEM_4_SET, SCALE2_ITEM_4_ACT,
                    SCALE2_ITEM_5, SCALE2_ITEM_5_SET, SCALE2_ITEM_5_ACT,
                    SCALE3_ITEM_1, SCALE3_ITEM_1_SET, SCALE3_ITEM_1_ACT,
                    SCALE3_ITEM_2, SCALE3_ITEM_2_SET, SCALE3_ITEM_2_ACT,
                    SCALE3_ITEM_3, SCALE3_ITEM_3_SET, SCALE3_ITEM_3_ACT,
                    SCALE3_ITEM_4, SCALE3_ITEM_4_SET, SCALE3_ITEM_4_ACT,
                    SCALE3_ITEM_5, SCALE3_ITEM_5_SET, SCALE3_ITEM_5_ACT
                } = report;

                // Replace periods with dashes in the DATE field and format as YYYY-MM-DD
                const [day, month, year] = report.DATE.split('.');
                const formattedDate = `${year}-${month}-${day}`;
                // console.log('time date:', TIME);
                // Check if the record already exists based on a unique combination (e.g., NO and DATE)
                const existingReport = await Report.findOne({
                    where: {
                        NO: NO,
                        DATE: formattedDate
                    }
                });

                // If the record does not exist, insert it into the database
                if (!existingReport) {
                    await Report.create({
                        NO, DATE: formattedDate, TIME, BATCH_NO, FEED_NAME,
                        SCALE1_ITEM_1, SCALE1_ITEM_1_SET, SCALE1_ITEM_1_ACT,
                        SCALE1_ITEM_2, SCALE1_ITEM_2_SET, SCALE1_ITEM_2_ACT,
                        SCALE1_ITEM_3, SCALE1_ITEM_3_SET, SCALE1_ITEM_3_ACT,
                        SCALE1_ITEM_4, SCALE1_ITEM_4_SET, SCALE1_ITEM_4_ACT,
                        SCALE1_ITEM_5, SCALE1_ITEM_5_SET, SCALE1_ITEM_5_ACT,
                        SCALE2_ITEM_1, SCALE2_ITEM_1_SET, SCALE2_ITEM_1_ACT,
                        SCALE2_ITEM_2, SCALE2_ITEM_2_SET, SCALE2_ITEM_2_ACT,
                        SCALE2_ITEM_3, SCALE2_ITEM_3_SET, SCALE2_ITEM_3_ACT,
                        SCALE2_ITEM_4, SCALE2_ITEM_4_SET, SCALE2_ITEM_4_ACT,
                        SCALE2_ITEM_5, SCALE2_ITEM_5_SET, SCALE2_ITEM_5_ACT,
                        SCALE3_ITEM_1, SCALE3_ITEM_1_SET, SCALE3_ITEM_1_ACT,
                        SCALE3_ITEM_2, SCALE3_ITEM_2_SET, SCALE3_ITEM_2_ACT,
                        SCALE3_ITEM_3, SCALE3_ITEM_3_SET, SCALE3_ITEM_3_ACT,
                        SCALE3_ITEM_4, SCALE3_ITEM_4_SET, SCALE3_ITEM_4_ACT,
                        SCALE3_ITEM_5, SCALE3_ITEM_5_SET, SCALE3_ITEM_5_ACT
                    });
                } else {
                    console.log(`Record with NO: ${NO} and DATE: ${formattedDate} already exists. Skipping.`);
                }
            }

          
            console.log('All records have been added and fetched successfully!');
            
            event.reply('error', 'Added reports successfully!');

        } catch (error) {
            console.log('Error adding records:', error);
            // event.reply('error', 'Failed to add records');
        }
    });
};


const getAllReports = () => {
    ipcMain.on('get-all-reports', async (event) => {
        const Report = require('../models/reportdb')(sequelize, DataTypes);

        try {

            const allReports = await Report.findAll();
            // Send the queried data back to the renderer process

            event.reply('display-reports', allReports);
            console.log('All records have been fetched successfully');
        } catch (error) {
            console.error('Error querying posts:', error);
            event.reply('error', 'Failed to query posts');
        }
    });
};

// const queryReports = () => {
//     ipcMain.on('query-reports', async (event, data) => {
//         const Report = require('../models/reportdb')(sequelize, DataTypes);

//         try {
//             // Extract fromDate and toDate from the data object
//             console.log(data);
//             const { fromDate, toDate } = data;

//             console.log('Querying reports between', fromDate, 'and', toDate);
//             // Query reports where the date is between fromDate and toDate
//             const reports = await Report.findAll({
//                 where: {
//                     date: {
//                         [Op.between]: [
//                             fromDate, // '2024-10-02'
//                             toDate // '2024-10-09'
//                         ]
//                     }
//                 }
//             });

//             event.reply('display-reports', reports);
//             console.log('Reports have been queried successfully');
//         } catch (error) {
//             console.error('Error querying reports:', error);
//             event.reply('error', 'Failed to query reports');
//         }
//     });
// }

const queryReports = () => {
    ipcMain.on('query-reports', async (event, data) => {
        const Report = require('../models/reportdb')(sequelize, DataTypes);

        try {
            // Extract criteria from the data object
            const {
                fromDate,
                toDate,
                reportType,
                startTime,
                endTime,
                shiftType
            } = data;

            console.log('Received query data:', data);

            // Construct the where clause dynamically based on the received data
            let whereClause = {};
            if ((fromDate !== toDate) && (shiftType === 'day')) {
                whereClause = {
                    ...(fromDate && toDate && {
                        date: {
                            [Op.between]: [fromDate, toDate]
                        }
                    }),
                    // ...(startTime && endTime && {
                    //     time: {
                    //         [Op.between]: ['01:00', '24:00']
                    //     }
                    // }),
                  
             
                };
              
            }
            else if((fromDate === toDate) && (shiftType === 'day')){
              
                whereClause = {
                    ...(fromDate && toDate && {
                        date: fromDate
                    }),
                   
                };
            }
            else{
                whereClause = {
                    ...(fromDate && toDate && {
                        date: {
                            [Op.between]: [fromDate, toDate]
                        }
                    }),
                    ...(startTime && endTime && {
                        time: {
                            [Op.between]: [startTime, endTime]
                        }
                    })
                };

            }
            

            console.log('Querying reports with the following criteria:', whereClause);

            // Dynamic query based on reportType (if material report)
            let attributes = [];
            let reports = [];

            switch (reportType) {
                case 'material':
                    console.log('Querying material reports');
                    attributes = [
                        'SCALE1_ITEM_1',
                        'SCALE1_ITEM_2',
                        'SCALE1_ITEM_3',
                        'SCALE2_ITEM_1',
                        [fn('SUM', col('SCALE1_ITEM_1_SET')), 'total_SCALE1_ITEM_1_SET'],
                        [fn('SUM', col('SCALE1_ITEM_1_ACT')), 'total_SCALE1_ITEM_1_ACT'],
                        [fn('SUM', col('SCALE1_ITEM_2_SET')), 'total_SCALE1_ITEM_2_SET'],
                        [fn('SUM', col('SCALE1_ITEM_2_ACT')), 'total_SCALE1_ITEM_2_ACT'],
                        [fn('SUM', col('SCALE1_ITEM_3_SET')), 'total_SCALE1_ITEM_3_SET'],
                        [fn('SUM', col('SCALE1_ITEM_3_ACT')), 'total_SCALE1_ITEM_3_ACT'],
                        [fn('SUM', col('SCALE2_ITEM_1_SET')), 'total_SCALE2_ITEM_1_SET'],
                        [fn('SUM', col('SCALE2_ITEM_1_ACT')), 'total_SCALE2_ITEM_1_ACT'],
                    ];
                    reports = await Report.findAll({
                        where: whereClause,
                        attributes: attributes,
                        group: ['SCALE1_ITEM_1', 'SCALE1_ITEM_2', 'SCALE1_ITEM_3', 'SCALE2_ITEM_1'] // Group by the string values
                    });
                    const formattedReports = reports.map(report => {
                        return [
                            {
                                material: report.dataValues.SCALE1_ITEM_1 || '', // Display actual material names
                                SET: report.dataValues.total_SCALE1_ITEM_1_SET || 0,
                                ACT: report.dataValues.total_SCALE1_ITEM_1_ACT || 0
                            },
                            {
                                material: report.dataValues.SCALE1_ITEM_2 || '',
                                SET: report.dataValues.total_SCALE1_ITEM_2_SET || 0,
                                ACT: report.dataValues.total_SCALE1_ITEM_2_ACT || 0
                            },
                            {
                                material: report.dataValues.SCALE1_ITEM_3 || '',
                                SET: report.dataValues.total_SCALE1_ITEM_3_SET || 0,
                                ACT: report.dataValues.total_SCALE1_ITEM_3_ACT || 0
                            },
                            {
                                material: report.dataValues.SCALE2_ITEM_1 || '',
                                SET: report.dataValues.total_SCALE2_ITEM_1_SET || 0,
                                ACT: report.dataValues.total_SCALE2_ITEM_1_ACT || 0
                            }
                        ];
                    }).flat();
                    event.reply('display-query-results-material', formattedReports);
                    break;
                case 'batch':
                    
                    reports = await Report.findAll({
                        where: whereClause,
                    });
                    event.reply('display-query-results-batch', reports);
                   
                    break;
                case 'recipe':
                    // Define the attributes to sum up based on FEED_NAME
                    attributes = [
                        'FEED_NAME',  // Include FEED_NAME to group by
                        [fn('SUM', col('SCALE1_ITEM_1_SET')), 'total_SCALE1_ITEM_1_SET'],
                        [fn('SUM', col('SCALE1_ITEM_1_ACT')), 'total_SCALE1_ITEM_1_ACT'],
                        [fn('SUM', col('SCALE1_ITEM_2_SET')), 'total_SCALE1_ITEM_2_SET'],
                        [fn('SUM', col('SCALE1_ITEM_2_ACT')), 'total_SCALE1_ITEM_2_ACT'],
                        [fn('SUM', col('SCALE1_ITEM_3_SET')), 'total_SCALE1_ITEM_3_SET'],
                        [fn('SUM', col('SCALE1_ITEM_3_ACT')), 'total_SCALE1_ITEM_3_ACT'],
                        [fn('SUM', col('SCALE2_ITEM_1_SET')), 'total_SCALE2_ITEM_1_SET'],
                        [fn('SUM', col('SCALE2_ITEM_1_ACT')), 'total_SCALE2_ITEM_1_ACT']
                    ];

                    // Query the reports grouped by FEED_NAME
                    reports = await Report.findAll({
                        where: whereClause,
                        attributes: attributes,
                        group: ['FEED_NAME']  // Group by FEED_NAME
                    });

                    // Format the results for the renderer process
                    const formattedRecipeReports = reports.map(report => {
                        // Calculate total Set and Act values
                        const totalSet = (
                            (report.dataValues.total_SCALE1_ITEM_1_SET || 0) +
                            (report.dataValues.total_SCALE1_ITEM_2_SET || 0) +
                            (report.dataValues.total_SCALE1_ITEM_3_SET || 0) +
                            (report.dataValues.total_SCALE2_ITEM_1_SET || 0)
                        );

                        const totalAct = (
                            (report.dataValues.total_SCALE1_ITEM_1_ACT || 0) +
                            (report.dataValues.total_SCALE1_ITEM_2_ACT || 0) +
                            (report.dataValues.total_SCALE1_ITEM_3_ACT || 0) +
                            (report.dataValues.total_SCALE2_ITEM_1_ACT || 0)
                        );

                        return {
                            feedName: report.dataValues.FEED_NAME || '', // FEED_NAME string
                            Set: totalSet,  // Sum of all Set values
                            Act: totalAct   // Sum of all Act values
                        };
                    });

                    // Send the results back to the renderer process
                    event.reply('display-query-results-recipe', formattedRecipeReports);
                    break;


            }
        } catch (error) {
            console.error('Error querying reports:', error);
            event.reply('error', 'Failed to query reports');
        }
    });
};




module.exports = { addNewRecords, getAllReports, queryReports };
