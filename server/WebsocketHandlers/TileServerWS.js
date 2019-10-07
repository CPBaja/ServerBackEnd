const log = require(logger)("TileServerWS");
const arp = require("app-root-path");
const tileDir = arp + process.env.TILE_DIR;

/*
===> REQUEST FORMAT:
{
    channel: "downloadMapArea", //channelId
    long1: 0.00000,
    lat1: 0.0000,
    long2: 0.0000,
    lat2: 0.0000
}

===> SUCCESS REPLY FORMAT:
{
    channel: "notification",
    type: "success",
    heading: "Map Download"
    message: "Download successfully started."
}

===> ERROR REPLY FORMAT:
{
    channel: "notification",
    type: "error",
    heading: "Map Download"
    message: "Error starting map download."
}

*/


module.exports = (webSocketServer) => {
    webSocketServer.on("downloadMapArea", (wss, ws, data) => {
        log.info(`Client requested download for map area.`);
    });
};

function getTileArray(lon1, lat1, lon2, lat2, zoomMax, zoomMin) {
    let domain;
    if(lon1 <= lon2) {domain = lon2 - lon1} //We are not dealing with the seam, domain is simple
    else{domain = lon2 - (lon1-360)} //We are traveling across the seam, subtract 360 from the west boundary to allow range calculation

    console.log(domain);

    /*
    for(let z = zoomMin; z <= zoomMax; z++){ //For each zoom level...

    }

     */

}

function toTileCoordinate(lon, lat, zoom) {
    return {x:long2tile(lon,zoom), y:lat2tile(lat,zoom)}
}



function Template(template, variables) {
    return template.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
        return variables[varName];
    });
}

function sign(num) {
}