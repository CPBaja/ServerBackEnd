const stream = require("stream");
const fs = require("graceful-fs");
const arp = require("app-root-path");
const path = require("path");
const readline = require("readline");
const lineTransform = require("./Pipes/LineTransform");

class ConsoleWriter extends stream.Writable{
    constructor(options) {
        super(options);
    }

    _write(chunk, encoding, next){
        //console.log(chunk);

        setTimeout(() => {
            console.log(chunk.toString());
            console.log("----------------------------");
            next();
        }, 1);

    }

}

//setTimeout(() => {}, 30000);