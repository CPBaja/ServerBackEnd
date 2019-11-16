require("dotenv").config(); //Load ENV variables first thing first

const EventEmitter = require("events"); //Create an app-wide eventEmitter to let modules communicate
const path = require("path");

global["imc"] = new EventEmitter();
global["__appdir"] = __dirname;
global["absPath"] = function(...args){
    return path.resolve(...args);
};


async function loadModules(){
    /*LOGGER SETUP+STARTUP*/
    require("./Logger");

    /*DB SETUP+START*/
    await require("./Data.js")();

    /*HTTP SERVER SETUP + START*/
    require("./Server.js");
}

loadModules();

console.log(JSON.stringify({
    channel: "dataRequest",
    range: [0,1],
    runId: 0,
    density: 10,

}));
//IK loading is funky - the DB uses pretty much only promises/async and bitches if I try to sync it. So, here we are.

