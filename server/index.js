require("dotenv").config(); //Load ENV variables first thing first
console.log(process.env.TILE_PROVIDER_TEMPLATE);

const EventEmitter = require("events"); //Create an app-wide eventEmitter to let modules communicate
global["imc"] = new EventEmitter();

/*LOGGER SETUP+STARTUP*/
require("./Logger");

/*DB SETUP+START*/
require("./Database.js");

/*HTTP SERVER SETUP + START*/
require("./Server");



