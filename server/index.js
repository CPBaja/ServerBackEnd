require("dotenv").config(); //Load ENV variables first thing first

/*LOGGER SETUP+STARTUP*/
require("./Logger");

/*DB SETUP+START*/
require("./Database.js");

/*HTTP SERVER SETUP + START*/
require("./Server");



const fs = require("graceful-fs");
const arp = require("app-root-path");
const wrap = require("wrap-around");
//In degrees
let maxRange = 100;
let maxDomain = 100;

getTileArray(-120.732, 35.307, -120.5780, 35.2308, 18,0);

function getTileArray(lon1, lat1, lon2, lat2, zoomMax, zoomMin) {
    let domain;
    if(lon1 <= lon2) {domain = lon2 - lon1} //We are not dealing with the seam, domain is simple
    else{domain = lon2 - (lon1-360)} //We are traveling across the seam, subtract 360 from the west boundary to allow domain calculation
    domain = Math.abs(domain);
    let domainN = domain - 180; //Domain STARTING at -180 (Tile 0!!)

    let range = Math.abs(lat2 - lat1);
    let rangeN = 90 - range;
    console.log(domain);
    console.log(range);

    if(range > maxRange || domain > maxDomain){ console.log("ERR: Area Too Big!"); return;}

    for(let z = zoomMin; z <= zoomMax; z++){ //For each zoom level...
        for(let x = 0; x <= range2tile(domain, z); x++){ //Get a 0-maxXTile range

            let xi= long2tile(lon1, z); //Get an offset...
            let xt = wrap(Math.pow(2, z), xi + x);

            for (let y = 0; y <= range2tile(range, z); y++){
                let yi = lat2tile(lat1, z);
                let yt = yi + y;
                let tileId = getTileId("mapbox.streets", z, xt, yt);
                //fs.createReadStream(arp + "/resources/TestTile.png").pipe(fs.createWriteStream(arp + `/tiles/${tileId}.png`));
                console.log(tileId);
            }
        }
    }
}

function range2tile(r, zoom){
    return Math.floor(map(r, 0,360, 0, Math.pow(2, zoom)));
}

function map(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
function Template(template, variables) {
    return template.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
        return variables[varName];
    });
}

function getTileId(tileSet, z, x, y){
    if(tileSet && !isNaN(z) && !isNaN(x) && !isNaN(y)){ //If all params exist, generate the filename. Otherwise, return undefined.
        return `${tileSet}_${z}_${x}_${y}`
    } else {
        return undefined;
    }
}