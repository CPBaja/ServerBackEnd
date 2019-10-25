/*
* Transforms stream of bytes (from .createReadStream or any other byte stream) into a stream of text lines.
* */


const stream = require("stream");

class LineParser extends stream.Transform {
    constructor(options){
        super(options);
    }

    _transform(chunk, encoding, next){
        let chunkStr = chunk.toString(); //Convert the chunk into a string
        //Split it on the newline and push each line to the readable side.
        chunkStr.split("\n").forEach((str) => {
            this.push(str)
        });
        next();
    }
}

module.exports = LineParser;