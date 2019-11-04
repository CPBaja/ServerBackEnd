const log = require(logger)("BinIngester");
const fs = require("graceful-fs");
const path = require("path");

const BlockParser = require("./Pipes/BinParser");
const EntryFormatter = require("./Pipes/EntryFormatter");
const MongoWriter = require("./Pipes/MongoWriter");

class BinIngester {
    constructor(file, rootDir) {
        this.file = file;
        this.rootDir = rootDir;
    }

    async ingest(){
        const fileStats = fs.statSync(path.resolve(this.rootDir, this.file));


        /*First, insert all necessary data into the runMeta DB before actually loading all
        * While this is happening, DataLoader is blocked to prevent loading of the same file twice (If dirwatch is fired)
        * */
        let LargestIdDoc = await DB.cRunMeta.find({}).sort({"id": -1}).limit(1).toArray();
        LargestIdDoc = LargestIdDoc[0];
        const NewId = (LargestIdDoc && !isNaN(LargestIdDoc.id)) ? LargestIdDoc.id + 1 : 0;
        console.log(NewId);
        const MetaObj = {
            Completed: false,
            OriginalFileName: this.file,
            TimeInserted: Date.now(),
            id: NewId
        };
        await DB.cRunMeta.insertOne(MetaObj);

        /*Do actual ingestion of the file*/
        let timeStarted = Date.now();
        log.warn(`Beginning ingestion for ${this.file}. Size on disk is ${humanFileSize(fileStats.size, true)}. This will take approximatly ${Math.floor(fileStats.size/838495)} seconds.`);
        //Ingest one at a time. TODO: Investigate allowing parallel ingests. Speed advantages? Disadvantages?
        await new Promise(resolve => fs.createReadStream(path.resolve(this.rootDir, this.file))
            .pipe(new BlockParser())
            .pipe(new EntryFormatter(NewId))
            .pipe(new MongoWriter())
            .on("finish", () => {
                log.info(`Wrote ${this.file} in ${Date.now() - timeStarted}ms`);
                resolve();
            })
        );

        //Last of all, update the meta to indicate that insertion was successful.
        await DB.cRunMeta.updateOne({id: NewId}, {$set: {Completed: true}});

    }
}

function humanFileSize(bytes, si) {
    let thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    let units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

module.exports = BinIngester;