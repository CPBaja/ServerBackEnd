/*
* Responsible for registering websocket message handlers.
* */
const log = require(logger)("WSS");
const EventEmitter = require("events");
const webSocket = require("ws");

class WebSocketServer extends EventEmitter{
    constructor(WssOptions){
        super();
        log.info("Starting WSS");
        this._wss = new webSocket.Server( WssOptions);
        this._wss.on("connection", (ws) => this.connection(this._wss, ws));
    }

    connection(wss, ws){
        log.http(`Accepted connection from ${ws._socket.remoteAddress}`);
        this.emit("connection", wss, ws);
        ws.on("message", (data) => this.message(wss, ws, data));
        ws.on("error", (data) => this.error(wss, ws, data));
        ws.on("close", (data) => this.close(wss, ws, data));
    }

    message(wss, ws, data){
        log.http(`Received message from ${ws._socket.remoteAddress}: ${data}`);
        this.emit("message", wss, ws, data);
        try{
            let parsedMessage = JSON.parse(data);
            //console.log(parsedMessage);
            //parsedMessage = {type: "topkek"};
            console.log(parsedMessage.type);
            if(parsedMessage.type){
                console.log("sdadas");
                this.emit(parsedMessage.type, wss, ws, data);
            } else {
                log.warn(`Typeless JSON received from ${ws._socket.remoteAddress}`);
                this.emit("noType", wss, ws, data);
            }
        }catch (e) {
            log.warn(`Unparseable message received from ${ws._socket.remoteAddress}`);
            this.emit("parseError", wss, ws, data);
        }
    }

    close(wss, ws, closeEvent){
        log.http(`Connection with ${ws._socket.remoteAddress} was closed by client - ${closeEvent}`);
    }

    error(wss, ws, errorEvent){
        log.error(`WS connection with ${ws._socket.remoteAddress} errored - ${errorEvent}`);
    }
}

module.exports = WebSocketServer;

