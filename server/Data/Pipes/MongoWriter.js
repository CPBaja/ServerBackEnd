const stream = require("stream");

const chunkSize = 10;

class MongoWriter extends stream.Writable {
    constructor() {
        super({objectMode: true});
        this.bufferedRuns = [];
    }

    _write(obj, encoding, next) {
        if(this.bufferedRuns.length <= chunkSize){ //If haven't filled the buffer, add the obj and exit.
            this.bufferedRuns.push(obj);
            next();
        } else {
            this.writeToMongo().then(next());
        }
    }

    async writeToMongo(){
        await DB.cRuns.insertMany(this.bufferedRuns);
        this.bufferedRuns = [];
    }
}

module.exports = MongoWriter;