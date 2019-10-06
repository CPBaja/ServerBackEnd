const http = require("http");
const webSocket = require("ws");
const express = require("express");
const log = require(logger)("Server");


const port = process.env.HTTP_PORT;

/*Create the express app + register it*/
let app = express();
let server = http.createServer(app);

/*Create the websocket on the HTTP server*/
let wss = new webSocket.Server({server});

/*Create the Express app by adding to the already registered one.*/
require("./ExpressApp.js")(app);

/*Create the socket server*/
require("./WebSocketServer.js")(wss);

/*Start the HTTP Server*/
server.listen(port, () => log.info(`App listening on port ${port}!`));

