const wrap = require("wrap-around");
const log = require(logger)("TileUtil");

const providerUrlTemplate = process.env.TILE_PROVIDER_TEMPLATE;
const providerApiKey = process.env.TILE_PROVIDER_API_KEY;

const defaultTileSet = "mapbox.streets";

const maxDomain = .3;
const maxRange = .3;

const zoomMax = 7;
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
        exportObject.getTileId(this.tileSet, this.z, this.x, this.y);
    }

    get providerUrl() {
        exportObject.template(providerUrlTemplate, {
            tileSet: this.tileSet,
            z: this.z,
            x: this.x,
            y: this.y,
            apiKey: providerApiKey
        });
    }
}

const exportObject = {
    getAreaTiles: (coord1, coord2) => { //Takes 2 lon/lat coords and generates an array of tile objects
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
            return;
        }

        let tiles = [];
        let ctr = 0;

        for (let z = zoomMin; z <= zoomMax; z++) { //For each zoom level...
            for (let x = 0; x <= exportObject.range2tile(domain, z); x++) { //For each tile at zoom level Z in our domain
                let xi = exportObject.long2tile(lon1, z); //Offset the current tile by our start tile
                let xt = wrap(Math.pow(2, z), xi + x); //Wrap it to handle going across the seam
                for (let y = 0; y <= exportObject.range2tile(range, z); y++) { //Same for Y as X
                    let yi = exportObject.lat2tile(lat1, z);
                    let yt = yi + y;

                    let newTile = new Tile(defaultTileSet, z, xt, yt);
                    tiles.push(newTile);
                    ctr++;
                }
            }
        }
        log.info(`Generated ${ctr} tiles in ${Date.now() - itime}`);
        return tiles;
    },

    filterExistingTiles(tiles, existingTiles) { //Removes any tiles present in the existing ones.
        const iLen = tiles.length;
        let newArr = tiles.filter(tile => !existingTiles.indexOf(tile.tileId));
        log.info(`Filtered ${iLen - newArr.length} tiles.`);
        return newArr;
    },

    map: (num, in_min, in_max, out_min, out_max) => { //Maps the given function from the first range to the second
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    },

    range2tile: (r, zoom) => {
        return Math.floor(exportObject.map(r, 0, 360, 0, Math.pow(2, zoom)));
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

    downloadTile: (tile) => {
        let url = tile.providerUrl;

    },

    Coord: Coord,

    Tile: Tile
};

module.exports = exportObject;
