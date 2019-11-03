const stream = require("stream");


class ConsoleWriter extends stream.Writable{
    constructor(options) {
        super({objectMode: true});
        this.on("finish", () => console.log("DONENSKGENSIENGSIUENGIUSNEGIUES"));
    }

    _write(chunk, encoding, next){
        //console.log(chunk);

        //console.log(chunk);
        next();

    }

}

module.exports = ConsoleWriter;