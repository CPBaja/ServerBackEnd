/*
* Responsible for creating the express app by registering all needed handlers
* */

const fs = require("fs");
const path = require("path");
const log = require(logger)("Express");

module.exports = (expressApp) => {
    registerExpressHandlers(path.join(__dirname, "./HttpPathHandlers"), expressApp);
};

class ExpressApp {
    constructor() {

    }

    async initialize(){

    }
}

function registerExpressHandlers(dir, app){
    log.info("REGISTERING HTTP HANDLERS:");
    let files = fs.readdirSync(dir);
    files = files.filter((file) => path.extname(file) === ".js"); //Remove anything that isn't a JS file

    files.forEach((v) => {
        log.info(`Registering ${v}`);
        let h = require(path.join(dir, v));
        h(app); //Allow each handler to init by passing the express app.
    });
}