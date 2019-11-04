const stream = require("stream");

class EntryFormatter extends stream.Transform{
    constructor(id) {
        super({objectMode: true});
        this.id = id;
        this.num = 0;
        //this.on("finish", () => console.log(this.num))
    }

    _transform(obj, encoding, next){
        const outObj = {
            id:this.id,
            time: obj.time,
            ...obj.sensors
        };
        this.num++;
        //console.log(outObj);
        next(null, outObj);
    }

}
module.exports = EntryFormatter;