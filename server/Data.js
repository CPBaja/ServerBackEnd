const fs = require("graceful-fs");
const path = require("path");
const log = require(logger)("Data");
const Mongo = require("mongodb").MongoClient;
const sp = require("synchronized-promise");

const MongoUrl = "mongodb//localhost:27017/";
class Data {

    constructor() {
        log.info("Attempting database connection...");
        sp(this.connectToDb)(MongoUrl);
    }

    dbConnected(db){
       log.info("DB connected.");
       let dBaja = db.db("baja");
       dBaja.createCollection("runs")
           .then(res => log.info(res))
           .catch(err => log.error(err));
       db.close();
    }

    async connectToDb(url){
        await Mongo.connect(MongoUrl, {useUnifiedTopology: true})
            .then((db) => this.dbConnected(db),
                err => {log.error(err); process.exit();}
            )
    }
}

global["Data"] = new Data();
//require("./Data/streamTest");