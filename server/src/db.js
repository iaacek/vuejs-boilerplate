/* Module for setting up the database

 */

// npm packages
const sql = require('mssql');

// my packages
const config = require('../config.js');
const logger = require('./logger.js');

// let db = new sql.connect(config.db, function (err) {
//     if (err) {
//         logger.error(err);
//         process.exit(5);
//     }
// });

let db = new sql.ConnectionPool(config.db, function (err) {
    if (err) {
        logger.error('DB connection fail: ' + err);
        process.exit(5);
    }
});


// Global db error catcher - add email notification? Just one though as this catches the same error 100 times
db.on('error', err => {
    logger.error('Global DB problem:' + err);
});

module.exports = db;