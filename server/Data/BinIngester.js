const log = require(logger)("BinIngester");

class BinIngester {
    constructor(file) {
        this.file = file;
    }

    async start(){
        log.info(`Beginning ingestion for ${this.file}`);

        /*First, insert all necessary data into the runMeta DB before actually loading all
        * While this is happening, DataLoader is blocked to prevent loading of the same file twice (If dirwatch is fired)
        * */
        const LargestIdObj = await DB.cRunMeta.find({}).sort({"ID": -1}).limit(1).toArray();
        const NewId = "ID" in LargestIdObj ? LargestIdObj[0].ID + 1 : 0;
        console.log(NewId);
        const insertObj = {
            OriginalFileName: this.file,
            TimeInserted: Date.now(),
            ID: NewId
        };
        console.log(insertObj);
        await DB.cRunMeta.insert(insertObj);
    }
}

module.exports = BinIngester;