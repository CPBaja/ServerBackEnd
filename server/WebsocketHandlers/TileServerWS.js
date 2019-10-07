const log = require(logger)("TileServerWS");
const arp = require("app-root-path");
const tileDir = arp + process.env.TILE_DIR;

module.exports = (webSocketServer) => {
    webSocketServer.on("downloadMapArea", (wss, ws, data) => {
        log.info(`Client requested download for map area.`);
    });
};