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
        this.cleanDb().then(this.scanAndIngest.bind(this));

        new dirWatch(IngestDir).on("added", this.scanAndIngest.bind(this));

    }

    async cleanDb(){
        const uncompletedIngests = await DB.cRunMeta.find({Completed: false}).toArray();
        if(!uncompletedIngests){return;}
        log.warn(`Found ${uncompletedIngests.length} uncompleted ingests: ${uncompletedIngests.map(v => v.id).toString()}`);
        for(const ingest of uncompletedIngests){
            await DB.cRuns.deleteOne({id: ingest.id});
            await DB.cRunMeta.deleteOne({id: ingest.id});
        }
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

        //Create the ingester and start ingesting files synchronously, but async relative to the process.
        // IE. one at a time.
        this.startIngestion(toBeIngested);


    }

    async startIngestion(toBeIngested){
        for(const file of toBeIngested){
            const fileType = path.extname(file).toLowerCase();
            let ingester = TypeIngesters[fileType];
            await new ingester(file, IngestDir).ingest();
        }

        this.locked = false; //Unlock the loader
        if(this.updateNeeded) {this.scanAndIngest(); this.updateNeeded = false;}

        log.info("Finished file ingest session.");
    }
}

module.exports = new DataLoader();