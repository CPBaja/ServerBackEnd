const wrap = require("wrap-around");
const log = require(logger)("TileUtil");


const providerUrlTemplate = process.env.TILE_PROVIDER_TEMPLATE;
const providerApiKey = process.env.TILE_PROVIDER_API_KEY;

const defaultTileSet = "mapbox.streets";

const maxDomain = .3;
const maxRange = .3;

const zoomMax = 18;
const zoomMin = 0;

class Coord {
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }
}

class Tile {
    constructor(tileSet, z, x, y) {
        this.tileSet = tileSet;
        this.z = z;
        this.x = x;
        this.y = y;
    }

    get tileId() { //TODO: OPTIMIZE THESE FUNCTIONS - Cache results?
        return exportObject.getTileId(this.tileSet, this.z, this.x, this.y);
    }

    get providerUrl() {
        return exportObject.template(providerUrlTemplate, {
            tileSet: this.tileSet,
            z: this.z,
            x: this.x,
            y: this.y,
            apiKey: providerApiKey
        });
    }
}

const exportObject = {
    getAreaTiles: (coord1, coord2) => { //Takes 2 lon/lat coords and generates an array of tile objects in the given 3d area
        let itime = Date.now();

        let lon1 = coord1.lon;
        let lat1 = coord1.lat;
        let lon2 = coord2.lon;
        let lat2 = coord2.lat;

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
            log.error("Requested area too thicc!");
            return []; //Return a blank array to not propagate the err
        }

        let tiles = [];
        let ctr = 0;

        for (let z = zoomMin; z <= zoomMax; z++) { //For each zoom level...
            for (let x = 0; x <= exportObject.domain2tile(domain, z); x++) { //For each tile at zoom level Z in our domain
                let xi = exportObject.long2tile(lon1, z); //Offset the current tile by our start tile
                let xt = wrap(Math.pow(2, z), xi + x); //Wrap it to handle going across the seam

                //Y is easier because we don't have a seam to deal with. Just go from coord1 to coord2
                for (let y = exportObject.lat2tile(lat1, z); y <= exportObject.lat2tile(lat2, z); y++) {
                    //Create a new tile object for each coord in the 3d area and push it to the array (And add to a ctr)
                    let newTile = new Tile(defaultTileSet, z, xt, y);
                    tiles.push(newTile);
                    ctr++;
                }
            }
        }
        log.info(`Generated ${ctr} tiles in ${Date.now() - itime}ms`);
        return tiles; //Return the arr of tiles.
    },

    filterExistingTiles(tiles, existingTiles) { //Removes any tiles present in the already indexed/downloaded ones.
        const iLen = tiles.length;

        //If NOT present in indexed files, allow it through
        let newArr = tiles.filter(tile => existingTiles.indexOf(`${tile.tileId}.png`) < 0);
        log.info(`Filtered ${iLen - newArr.length} tiles.`);
        return newArr;
    },

    map: (num, in_min, in_max, out_min, out_max) => { //Maps the given function from the first range to the second
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },

    domain2tile: (l, zoom) => {
        //return Math.floor(exportObject.map(r, 0, 360, 0, Math.pow(2, zoom)));
        return (Math.floor((l) / 360 * Math.pow(2, zoom)));
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

    Coord: Coord,

    Tile: Tile
};

module.exports = exportObject;
