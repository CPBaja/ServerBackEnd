const webSocketServer = require("./WebSocketServer");
const log = require(logger)("WebSocketApp");
const fs = require("fs");
const path = require("path");

const handlerDir = "./WebsocketHandlers";

module.exports = (WssOptions) => {
    let wss = new webSocketServer(WssOptions);
    registerWebsocketHandlers(path.join(__dirname, handlerDir), wss);
};

function registerWebsocketHandlers(dir, wss){
    log.info("REGISTERING WEBSOCKET HANDLERS:");
    let files = fs.readdirSync(dir);
    files = files.filter((file) => path.extname(file) === ".js"); //Remove anything that isn't a JS file

    files.forEach((v) => {
        log.info(`Registering ${v}`);
        let h = require(path.join(dir, v));
        h(wss); //Allow each handler to init by passing the express app.
    });

    imc.emit("buildTileIndex");
}