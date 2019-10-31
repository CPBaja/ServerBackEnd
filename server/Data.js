const fs = require("graceful-fs");
const path = require("path");
const log = require(logger)("Data");
const Mongo = require("mongodb").MongoClient;

const MongoUrl = "mongodb://localhost:27017/";
class Data {

    constructor() {
        Mongo.connect(MongoUrl, { useUnifiedTopology: true })
            .then((db) => this.dbConnected(db), (err) => {log.error("Database Connection Failed!!"); log.error(err)});
    }

    dbConnected(db){
       log.info("DB connected.");
       let dBaja = db.db("baja");
       dBaja.createCollection("runs")
           .then(res => log.info(res))
           .catch(err => log.error(err));
       db.close();
    }

}

global["Data"] = new Data();
//require("./Data/streamTest");