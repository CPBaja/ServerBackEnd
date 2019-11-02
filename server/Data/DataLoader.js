const log = require(logger)("DataLoader");
const fs = require("graceful-fs");
const path = require("path");
const dirWatch = require("../Util/DirWatch");

const BinIngester = require("./BinIngester");

const TypeIngesters = { //Relates
  ".bin" : BinIngester
};
const AllowedFileTypes = Object.keys(TypeIngesters);

const IngestDir = "ingest";


class DataLoader {
    constructor() {
        this.locked = false;
        this.updateNeeded = false;
    }

    async initialize() {
        log.info("Begin loading...");
        await this.scanAndIngest();

        new dirWatch(IngestDir).on("added", this.scanAndIngest.bind(this));

    }

    async scanAndIngest() {
        //Lock the ingester, so that only one is running at a time.
        if(this.locked){this.updateNeeded = true; return;}
        this.locked = true;

        log.info("Scanning and ingesting...");
        let ingestableFiles = fs.readdirSync(IngestDir);
        let ingestedFiles = await DB.cRunMeta.distinct("OriginalFileName"); //Get already ingested files

        //Filter list to files not already in DB and with valid extensions.
        let toBeIngested = ingestableFiles.filter(v => !ingestedFiles.includes(v) && AllowedFileTypes.includes(path.extname(v).toLowerCase()));

        log.info(`Found local files: ${ingestableFiles}`);
        log.info(`Will ingest: ${toBeIngested}`);

        //Create an ingester for each file, and set them running.
        for(const file of toBeIngested){
            const fileType = path.extname(file).toLowerCase();
            let ingester = TypeIngesters[fileType];
            await new ingester(file).start();
        }

        this.locked = false; //Unlock it

        //If somthing tried to update while locked, run again.
        if(this.updateNeeded) {this.scanAndIngest(); this.updateNeeded = false;}

    }
}

module.exports = new DataLoader();