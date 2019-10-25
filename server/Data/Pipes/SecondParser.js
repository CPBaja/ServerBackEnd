const stream = require("stream");


class SecondParser extends stream.Transform{
    constructor(options) {
        super({objectMode: true});

        this.sensorDataBuffer = [];

    }

    _write(sensorObj, encoding, next){
        //console.log(chunk);
        let sensorChar = sensorObj.char;
        if(!this.sensorDataBuffer.find(v => v.char === sensorObj.char)){ //If we haven't recieved the sensor yet, just add it to the buffer.
            this.sensorDataBuffer.push(sensorObj);
            next();
            return;
        } else {
            console.log("found Duplicate");
            this.parseAndFlush();
            next();
            return;
        }
    }

    parseAndFlush(){

    }

    flushBuffer(){

    }

}

module.exports = SecondParser;