const log = require(logger)("TileServerWS");
const arp = require("app-root-path");
const tileDir = arp + process.env.TILE_DIR;
const TileUtil = require(arp + "/server/Util/TileUtil.js");

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
};

//===> ERROR REPLY FORMAT:
const errorReply = {
    channel: "notification",
    type: "error",
    heading: "Map Download",
    message: "Error starting map download."
};

module.exports = (webSocketServer) => {
    webSocketServer.on("downloadMapArea", (wss, ws, data) => {
        //console.log(data);
        //Begin downloading tiles using tileUtil
        setImmediate(() => { //Set it to be async
            let coord1 = new TileUtil.Coord(data.long1, data.lat1);
            let coord2 = new TileUtil.Coord(data.long2, data.lat2);
            let tiles = TileUtil.getAreaTiles(coord1, coord2);
            //console.log(tiles);
            tiles = TileUtil.filterExistingTiles(tiles, tileIndex);
            //console.log(tileIndex);
            //console.log(tiles);
            TileUtil.downloadTiles(tiles, "tiles");

            imc.emit("buildTileIndex");
        });
    });
};

console.log(JSON.stringify({
    channel:"downloadMapArea",
    long1: -120.6828,
    lat1: 35.3246,
    long2: -120.6481,
    lat2: 35.2966
}));





