/*
* Responsible for registering websocket message handlers.
* */
const log = require(logger)("WSS");

module.exports = (wss) => {
    log.info("Registering WSS")
    wss.on("connection", (ws) => connection(wss, ws));
};

function connection(wss, ws) {
    ws.on("message", (data) => message(wss, ws, data));
    log.info(`WSS: Accepted new connection from ${ws._socket.remoteAddress}`);
}

function message(wss, ws, data) {
    log.debug(`${ws._socket.remoteAddress} sent ${data}`);
}