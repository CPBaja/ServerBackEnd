const log = require(logger)("TileServerWS");
const arp = require("app-root-path");
const tileDir = arp + process.env.TILE_DIR;
const wrap = require("wrap-around");
const fs = require("graceful-fs");

/*Download Params*/
const maxRange = .015;
const maxDomain = .015;

/*===> REQUEST FORMAT:
{
    channel: "downloadMapArea", //channelId
    long1: 0.00000,
    lat1: 0.0000,
    long2: 0.0000,
    lat2: 0.0000
}
*/

//===> SUCCESS REPLY FORMAT:
const successReply = {
    channel: "notification",
    type: "success",
    heading: "Map Download",
    message: "Download successfully started."
}

//===> ERROR REPLY FORMAT:
const errorReply = {
    channel: "notification",
    type: "error",
    heading: "Map Download",
    message: "Error starting map download."
};

module.exports = (webSocketServer) => {
    webSocketServer.on("downloadMapArea", (wss, ws, data) => {
    });
};






