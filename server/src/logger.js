const { createLogger, format, transports } = require('winston');
const { colorize, combine, timestamp, printf } = format;
const momentTZ = require('moment-timezone');

const config = require('../config.js');

const level = process.env.LOG_LEVEL || 'info';

const myFormat = printf(info => {
    return `[${info.timestamp}] ${info.level}: ${info.message}`
});

// fix the time zone
const appendTimestamp = format((info, opts) => {
    if(opts.timeZone) info.timestamp = momentTZ().tz(opts.timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS');
    return info;
});


const logger = createLogger({
    format: combine(
        appendTimestamp({ timeZone: config.timeZone }),
        colorize(),
        myFormat
    ),
    transports: [new transports.Console()]
});

module.exports = logger;