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

let downloadLock = false;
/*===> REQUEST FORMAT:
{
    channel: "downloadMapArea", //channelId
    tileSet: "", //mapbox.streets, mapbox.satilite, etc...
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

            if(downloadLock){ //If already downloading, quit before we do anything.
                log.warn("Attempted concurrent download!");
                ws.sendNotification("error", "Map Download", "Download already started! Try again later.");
                return;
            }
            downloadLock = true;


            let dlCtr = 0;
            let timeStarted = Date.now();
            /*First, check validity and pull coords from the sent data*/
            if(isNaN(data.long1) || isNaN(data.long2) || isNaN(data.lat1) || isNaN(data.lat2) || !data.tileSet){
                log.error(`Received an invalid map download request: ${data}`);
                ws.sendNotification("error", "Map Download", "Invalid Request.");
            }
            let coord1 = new TileUtil.Coord(data.long1, data.lat1);
            let coord2 = new TileUtil.Coord(data.long2, data.lat2);

            /*Get an array of needed tiles to download and filter ones already in our tile dir.*/
            let tiles = TileUtil.getAreaTiles(coord1, coord2, data.tileSet);
            tiles = TileUtil.filterExistingTiles(tiles, tileIndex);

            //Notify the client their download is starting.
            ws.send(JSON.stringify({
                channel: "mapDownloadProgress",
                stage: "started",
                progress: 0
            }));

            /*Finally, batch download the images <concurrentDownloads> at a time*/
            async.eachOfLimit(tiles, concurrentDownloads, (tile, key, ecb) => {
                let tilePath = path.join(tileDir, `${tile.tileId}.png`); //Create the path of the new file...
                let stream = fs.createWriteStream(tilePath);
                let errored;
                //Request the tile...
                request(tile.providerUrl)
                    .on("error", function(){ //If there was an error downloading...
                        this.abort(); //Abort it
                        stream.end(); //End the stream
                        fs.unlinkSync(tilePath); //and delete the file
                        errored = true; //Set a flag to let the main thread know.
                        //log.error(`Error downloading from ${tile.providerUrl}`);
                        ecb(new Error());
                    })
                    .pipe(stream) //Pipe it to the local path+file
                    .on("finish", () => {
                        if (!errored) {
                            tileIndex.push(`${tile.tileId}.png`); //Push it to the index.

                            //TODO: SEND DOWNLOAD PROGRESS UPDATES TO THE CLIENT


                            log.debug(`Downloaded ${tile.tileId}.`);
                            dlCtr++;
                            ecb(null);//When download is finished, allow the queue to continue.
                        }

                    });

            }, (err) => { //This is run after all files have downloaded or there's been an error.
                if(err instanceof Error){
                    log.error("Double plus ungood error occurred when downloading files.");
                    ws.sendNotification("error", "Map Download", "Error downloading map.");
                } else {
                    log.info(`Downloaded ${dlCtr} in ${(Date.now() - timeStarted)/1000} seconds.`);
                }
                downloadLock = false; //As a last step, unlock the download code.

            });
        });
    });
};

/*
console.log(JSON.stringify({
    channel:"downloadMapArea",
    tileSet: "mapbox.satellite",
    long1: -120.6828,
    lat1: 35.3246,
    long2: -120.6481,
    lat2: 35.2966
}));
*/




