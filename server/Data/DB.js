const log = require(logger)("Data");
const Mongo = require("mongodb").MongoClient;

const MongoUrl = "mongodb://localhost:27017";
class DB {

    constructor() {
        this.db = undefined;
        this.dbBaja = undefined;
    }

    async initialize() {
        log.info("Attempting database connection...");
        await Mongo.connect(MongoUrl, {useUnifiedTopology: true})
            .then(this.setupDb.bind(this),
                err => {log.error(err); process.exit();}
            );
        log.info("DB finished initializing.");
    }

    async setupDb(db){
        log.info("Setting up DB");
        this.db = db;
        this.dbBaja = db.db("baja");
        this.cRuns = this.dbBaja.collection("runs");
        this.cTiles = this.dbBaja.collection("tiles");
        this.cRunMeta = this.dbBaja.collection("runmeta");
    }
}

let Db = new DB();
global["DB"] = Db;
module.exports = Db;
//require("./Data/streamTest");