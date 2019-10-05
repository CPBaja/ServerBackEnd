require("dotenv").config(); //Load ENV variables first thing first
const path = require("path");
const winston = require("winston");
const { format } = winston;


const logger = winston.createLogger({
    format: format.combine(
        winston.format.colorize({ all: true }),
        format.timestamp(),
        format.printf(i => `${i.timestamp} | ${i.message}`)
    ),
    transports:[
        new winston.transports.Console(),
        new winston.transports.File({filename: 'log.log'})
    ]});

global["log"] = logger;
global["appRoot"] = path.resolve(__dirname); //Set a global for the app's root dir

/*HTTP SERVER SETUP + START*/
require("./js/eServer.js");

