require("dotenv").config(); //Load ENV variables first thing first

const EventEmitter = require("events"); //Create an app-wide eventEmitter to let modules communicate
const path = require("path");

global["imc"] = new EventEmitter();
global["__appdir"] = __dirname;
global["absPath"] = function(...args){
    return path.resolve(...args);
};

/*LOGGER SETUP+STARTUP*/
require("./Logger");

/*DB SETUP+START*/
require("./Data.js");

/*HTTP SERVER SETUP + START*/
require("./Server");



