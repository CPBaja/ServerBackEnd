const log = require(logger)("Data");
const Mongo = require("mongodb").MongoClient;

const MongoUrl = "mongodb://localhost:27017";
const DropOnRun = false;

class DB {

    constructor() {
        this.db = undefined;
        this.dbBaja = undefined;
    }

    async initialize() {
        log.info("Attempting database connection...");
        await Mongo.connect(MongoUrl, {useUnifiedTopology: true})
            .then(this.setupDb.bind(this),
                err => {
                    log.error(err);
                    process.exit();
                }
            );
        log.info("DB finished initializing.");
    }

    async setupDb(db) {
        log.info("Setting up DB");
        this.db = db;
        this.dbBaja = db.db("baja");

        if(DropOnRun){
            await this.dbBaja.dropCollection("runs");
            await this.dbBaja.dropCollection("runmeta");
        }

        this.cRuns = await this.dbBaja.collection("runs");
        this.cRunMeta = await this.dbBaja.collection("runmeta");



        this.cRunMeta.createIndex({time: 1, id: 1});
    }
}

let Db = new DB();
global["DB"] = Db;
module.exports = Db;
//require("./Data/streamTest");