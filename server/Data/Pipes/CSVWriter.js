const fs = require("graceful-fs");
const stream = require("stream");

class CSVWriter extends stream.Transform {
    constructor(props) {
        super({objectMode: true});
        this.push("Time, 1, 1, 1, 1, 1\n");
    }

    _transform(obj, encoding, next) {
        let valArr = [];
        Object.keys(obj.sensors).map(key => valArr.push(obj.sensors[key]));
        let str = `${obj.time},${valArr.join(",")}\n`;
        //console.log(str);
        this.push(str);
        next();
    }
}

module.exports = CSVWriter;