const stream = require("stream");

class EntryFormatter extends stream.Transform{
    constructor(id) {
        super({objectMode: true});
    }

    _transform(obj, encoding, next){
        console.log(obj);
        next(null);
    }

}