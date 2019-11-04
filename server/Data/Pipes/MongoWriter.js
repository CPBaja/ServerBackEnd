const stream = require("stream");
const log = require(logger)("MongoWriter");

const chunkSize = 10000;

class MongoWriter extends stream.Writable {
    constructor() {
        super({objectMode: true});
        this.batch = [];
        this.timesWritten = 0;

        this.on("finish", () => this.writeToMongo()); //On eof, write last little bit of data.
    }

    _write(obj, encoding, next) {
        if(this.batch.length <= chunkSize){
            this.batch.push({insertOne: obj});
            next();
        } else {
            this.writeToMongo().then(() => next());
        }
    }

    async writeToMongo(){
        const timeStarted = Date.now();
        await DB.cRuns.bulkWrite(this.batch, {ordered: false});
        this.batch = [];
        this.timesWritten++;
        //console.log(`Wrote ${this.timesWritten} times. Latest took ${Date.now() - timeStarted}ms`);
    }
}

module.exports = MongoWriter;