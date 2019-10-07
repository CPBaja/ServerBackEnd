const wrap = require("wrap-around");
const log = require(logger)("TileUtil");

const maxDomain = .015;
const maxRange = .015;

const maxZoom = 18;
const minZoom = 0;

class coord{
    constructor(lon, lat){
        this.lon = lon;
        this.lat = lat;
    }
}

class tile{

};

module.exports = {
    getTileIdList: (coord1, coord2) => {
        let lon1 = coord1.lon;
        let lat1 = coord1.lat;
        let lon2 = coord2.lon;
        let lat2 = coord2.lat;

        let zoomMax = 18;
        let zoomMin = 0;

        let domain;

        if (lon1 <= lon2) {
            domain = lon2 - lon1
        } //We are not dealing with the seam, domain is simple
        else {
            domain = lon2 - (lon1 - 360)
        } //We are traveling across the seam, subtract 360 from the west boundary to allow domain calculation

        domain = Math.abs(domain); //The domain (long) of the region in degrees [0-360]
        let range = Math.abs(lat2 - lat1); //The range (lat) of the region in degrees [0-360]

        //Check to make sure the requested area is reasonable
        if (range > maxRange || domain > maxDomain) {
            log.warn("Requested area too thicc!");
            return;
        }

        for (let z = zoomMin; z <= zoomMax; z++) { //For each zoom level...
            for (let x = 0; x <= range2tile(domain, z); x++) { //For each tile at zoom level Z in our domain
                let xi = long2tile(lon1, z); //Offset the current tile by our start tile
                let xt = wrap(Math.pow(2, z), xi + x); //Wrap it to handle going across the seam
                for (let y = 0; y <= range2tile(range, z); y++) { //Same for Y as X
                    let yi = lat2tile(lat1, z);
                    let yt = yi + y;

                    /* We have the add*/
                    let tileId = getTileId("mapbox.streets", z, xt, yt);
                    fs.createReadStream(arp + "/resources/TestTile.png").pipe(fs.createWriteStream(arp + `/tiles/${tileId}.png`));
                    console.log(tileId);
                }
            }
        }
    },
    map: (num, in_min, in_max, out_min, out_max) => {
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },

    range2tile: (r, zoom) => {
        return Math.floor(this.map(r, 0, 360, 0, Math.pow(2, zoom)));
    },

    getTileId: (tileSet, z, x, y) => {
        if (tileSet && !isNaN(z) && !isNaN(x) && !isNaN(y)) { //If all params exist, generate the filename. Otherwise, return undefined.
            return `${tileSet}_${z}_${x}_${y}`
        } else {
            return undefined;
        }
    },
    long2tile: (lon, zoom) => {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    },
    lat2tile: (lat, zoom) => {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    },
    template: (template, variables) => {
        return template.replace(new RegExp("\{([^\{]+)\}", "g"), function (_unused, varName) {
            return variables[varName];
        });
    },

    coord: coord

};

