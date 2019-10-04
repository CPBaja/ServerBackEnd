const request = require("request");
const path = require("path");
const fs = require("fs");

const providerTemplate = process.env.TILE_PROVIDER_TEMPLATE;
const apiKey = process.env.TILE_PROVIDER_API_KEY || "";
const tileSets = process.env.TILE_PROVIDER_TILESETS.split(",");
const defaultTileSet = tileSets[0];
const tileDir = "tiles";
const errorTilePath = process.env.ERROR_TILE_PATH;

const tileIndex = fs.readdirSync(tileDir); //A cached list of stored tiles


module.exports = (app) => {
    app.get("/t/:tileSet/:z/:x/:y", (req, res) =>
    {
        let tileSet = req.params.tileSet, z = req.params.z, x = req.params.x, y = req.params.y;
        let tileId = getTileId(tileSet, z, x, y); //Attempt to generate an ID. Also checks param validity. Undefined if malformed

        //first, check to make sure request is in correct format.
        if(!tileId){ //Malformed tile request, fail it with 400.
            console.log(`MALFORMED tile request for ${tileSet}/${z}/${x}/${y}`);
            res.status(400).send("Malformed Tile Request");
            return;
        }

        //Not a malformed request, try to serve a result.
        res.type("image/png"); //We're only using PNGs, set the response content type.

        /*First try to serve it from the local cache*/
        let tileFile = `${tileId}.png`;

        if(tileIndex.includes(tileFile)){ //If we have the tile locally, just serve it.
            res.sendFile(path.join(appRoot, tileDir, tileFile));
            console.log(`Tile request for ${tileSet}/${z}/${x}/${y} served locally`);
            return;
        }

        /*We don't have the file locally, so try to proxy it in from our tile provider*/

        let providerTileUrl = Template(providerTemplate, {tileSet:tileSet, z:z, x:x, y:y, apiKey:apiKey});
        request.get(providerTileUrl)

            .on("error", () =>{ //If the proxy fails, serve our error image.
                console.log("Error proxying image from provider, sending the error tile.");
                res.sendFile(path.join(appRoot, errorTilePath));
            })
            .on("response", () => console.log(`Proxied tile request for ${tileSet}/${z}/${x}/${y}`))
            .pipe(res);








    });
};

//Setup a watch on the directory to keep our cache/index updated with changes to the tile directory.
fs.watch(tileDir, {},(eventType, fileName) => {
    if(eventType === "rename"){ //Fired when file added/removed/renamed in tiles. Used to keep index updated.

        //If file exists, make sure it's not in index already and add it.
        if(fs.existsSync(path.join(tileDir, fileName)) && !tileIndex.includes(fileName)) {
            tileIndex.push(fileName);

            //If the file has been removed, check if it's in the index and remove it if so.
        } else if (!fs.existsSync(path.join(tileDir, fileName)) && tileIndex.includes(fileName)) {
            let removeIndex = tileIndex.indexOf(fileName);
            tileIndex.splice(removeIndex, 1);
        }
    }
});

function getTileId(tileSet, z, x, y){
    if(tileSet && !isNaN(z) && !isNaN(x) && !isNaN(y)){ //If all params exist, generate the filename. Otherwise, return undefined.
        return `${tileSet}_${z}_${x}_${y}`
    } else {
        return undefined;
    }
}

function Template(template, variables) { //Templates variables into a given pattern. "this is a {var}"
    return template.replace(new RegExp("\{([^\{]+)\}", "g"), function(_unused, varName){
        return variables[varName];
    });
}
