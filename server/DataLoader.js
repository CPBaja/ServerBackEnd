const log = require(logger)("DataLoader");

class DataLoader {
    constructor(){

    }

    async initialize(){
        log.info("Begin loading...");
        await this.scanAndIngest();

    }

    async scanAndIngest(){
        let loadedIds = await DB.cRuns.distinct("id");
    }
}

module.exports = new DataLoader();