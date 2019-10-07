const webSocketServer = require("./WebSocketServer");
const log = require(logger)("WebSocketApp");
const webSocket = require("ws");

module.exports = (WssOptions) => {
    let wss = new webSocketServer(WssOptions);
};
