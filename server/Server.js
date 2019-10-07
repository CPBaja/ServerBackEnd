const http = require("http");
const webSocketServer = require("./WebSocketServer.js");
const express = require("express");
const log = require(logger)("Server");
const webSocket = require("ws");


const port = process.env.HTTP_PORT;

/*Create the express app + register it*/
let app = express();
let server = http.createServer(app);

/*Create the Express app by adding to the already registered one.*/
require("./ExpressApp.js")(app);

/*Create the socket server*/
require("./WebSocketApp.js")({server});



/*Start the HTTP Server*/
server.listen(port, () => log.info(`App listening on port ${port}!`));

