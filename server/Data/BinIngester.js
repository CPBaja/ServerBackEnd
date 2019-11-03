const log = require(logger)("BinIngester");
const fs = require("graceful-fs");
const path = require("path");

const BlockParser = require("./Pipes/BlockParser");
const ConsoleWriter = require("./Pipes/ConsoleWriter");
const MongoWriter = require("./Pipes/MongoWriter");

class BinIngester {
    constructor(file, rootDir) {
        this.file = file;
        this.rootDir = rootDir;
    }

    async start(){
        log.info(`Beginning ingestion for ${this.file}`);

        /*First, insert all necessary data into the runMeta DB before actually loading all
        * While this is happening, DataLoader is blocked to prevent loading of the same file twice (If dirwatch is fired)
        * */
        const LargestIdObj = await DB.cRunMeta.find({}).sort({"id": -1}).limit(1).toArray();
        const NewId = "id" in LargestIdObj ? LargestIdObj[0].id + 1 : 0;
        console.log(NewId);
        const insertObj = {
            OriginalFileName: this.file,
            TimeInserted: Date.now(),
            id: NewId
        };
        console.log(insertObj);
        //await DB.cRunMeta.insert(insertObj);
        fs.createReadStream(path.resolve(this.rootDir, this.file))
            .pipe(new BlockParser())
            .pipe(new EntryFormatter())
            //.pipe(new MongoWriter());

    }
}

module.exports = BinIngester;