require("dotenv").config(); //Load ENV variables first thing first
const path = require("path");
global["appRoot"] = path.resolve(__dirname); //Set a global for the app's root dir

/*WS SERVER SETUP + START*/
require("./js/websocketServer.js");

/*HTTP SERVER SETUP + START*/
require("./js/eServer.js");

