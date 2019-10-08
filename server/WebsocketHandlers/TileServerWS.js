const log = require(logger)("TileServerWS");
const arp = require("app-root-path");
const path = require("path");
const fs = require("graceful-fs");
const tileDir = arp + process.env.TILE_DIR;
const TileUtil = require(arp + "/server/Util/TileUtil.js");
const async = require("async");
const request = require("request");


/*Download Params*/
const maxRange = .015;
const maxDomain = .015;
const concurrentDownloads = 5;

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
        //Set this function to be async to not hang the server.
        setImmediate(() => {
            let dlCtr = 0;
            let timeStarted = Date.now();
            /*First, pull coords from the sent data*/ //TODO: CHECK VALIDITY OF RECEIVED DATA!!!
            let coord1 = new TileUtil.Coord(data.long1, data.lat1);
            let coord2 = new TileUtil.Coord(data.long2, data.lat2);

            /*Get an array of needed tiles to download and filter ones already in our tile dir.*/
            let tiles = TileUtil.getAreaTiles(coord1, coord2);
            tiles = TileUtil.filterExistingTiles(tiles, tileIndex);

            /*Finally, batch download the images <concurrentDownloads> at a time*/
            async.eachOfLimit(tiles, concurrentDownloads, (tile, key, ecb) => {
                let tilePath = path.join(tileDir, `${tile.tileId}.png`); //Create the path of the new file...
                let stream = fs.createWriteStream(tilePath);
                let errored;
                //Request the tile...
                request(tile.providerUrl)
                    .on("error", function(){
                        this.abort();
                        stream.end();
                        fs.unlinkSync(tilePath);
                        errored = true;
                        //log.error(`Error downloading from ${tile.providerUrl}`);
                        ecb(new Error());
                    })
                    .pipe(stream) //Pipe it to the local path+file
                    .on("finish", () => {
                        if (!errored) {
                            log.debug(`Downloaded ${tile.tileId}.`);
                            dlCtr++;
                            ecb(null);
                        }

                    }); //When finished, allow the queue to continue.

            }, (err) => {
                if(err instanceof Error){
                    log.error("Double plus ungood error occurred when downloading files.")
                } else {
                    log.info(`Downloaded ${dlCtr} in ${(Date.now() - timeStarted)/1000} seconds.`);
                    imc.emit("buildTileIndex"); //After all files are downloaded, log it and rebuild the tile index for posterity.
                }

            });
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





