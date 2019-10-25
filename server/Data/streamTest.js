const stream = require("stream");
const fs = require("graceful-fs");
const arp = require("app-root-path");
const path = require("path");
const LineParser = require("./Pipes/LineParser.js");
const SecondParser = require("./Pipes/SecondParser.js");
const SensorParser = require("./Pipes/SensorParser.js");
const ConsoleWriter = require("./Pipes/ConsoleWriter.js");
const testStream = require("./Pipes/TestGenerator");




let lineParser = new LineParser();
let secondParser = new SecondParser();
let sensorParser = new SensorParser();
let consoleWriter = new ConsoleWriter();

testStream.pipe(consoleWriter);

/*
fs.createReadStream('ingest/2.txt')
    .pipe(lineParser)
    .pipe(sensorParser)
    //.pipe(new ConsoleWriter());
    .pipe(secondParser);

//setTimeout(() => {}, 30000);
*/
