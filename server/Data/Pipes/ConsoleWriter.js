const stream = require("stream");


class ConsoleWriter extends stream.Writable{
    constructor(options) {
        super({objectMode: true});
    }

    _write(chunk, encoding, next){
        //console.log(chunk);

        setTimeout(() => {
            console.log(chunk.toString());
            //console.log("----------------------------");
            next();
        }, 0);

    }

}

module.exports = ConsoleWriter;