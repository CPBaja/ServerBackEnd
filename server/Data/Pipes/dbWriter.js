const stream = require("stream");
const fs = require("fs");

try {
    fs.unlinkSync("test.db");
}catch (e) {
    
}

const db = low(new async("test.db"));

db.defaults({runs: []}).write();

class dbWriter extends stream.Writable{
    constructor(options){
        super({objectMode: true});
    }

    _write(object, encoding, next){
        db.get("runs").push(object).write();
        next();
    }
}

module.exports = dbWriter;
