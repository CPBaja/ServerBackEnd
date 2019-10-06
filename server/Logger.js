const winston = require("winston");
const path = require("path");
const { format } = winston;

const fileTransport = {
    format: format.combine(
        format.timestamp(),
        format.printf(i => `${i.timestamp} | ${i.message}`)
    ),
    filename: 'log.log',
    level: "debug",
    options: {flags: 'w'}
};

const consoleTransport = {
    format: format.combine(
        winston.format.colorize({ all: true }),
        format.timestamp(),
        format.printf(i => `${i.timestamp} | ${i.message}`)
    ),
    filename: 'log.log',
    level: "debug"
};


const logger = winston.createLogger({
    transports:[
        new winston.transports.Console(consoleTransport),
        new winston.transports.File(fileTransport)
    ]});

//This acts as a proxy to the actual logger, adding the module label to logs.
module.exports = (label) => {
    return {
        info: (message) => logger.info(`[${label}]: ${message}`),
        warn: (message) => logger.warn(`[${label}]: ${message}`),
        debug: (message) => logger.debug(`[${label}]: ${message}`)
    }
};

global["logger"] = __filename;