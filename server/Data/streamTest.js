const fs = require("graceful-fs");

const LineParser = require("./Pipes/LineParser.js");
const SecondParser = require("./Pipes/SecondParser.js");
const SensorParser = require("./Pipes/SensorParser.js");
const ConsoleWriter = require("./Pipes/ConsoleWriter.js");
const BlockParser = require("./Pipes/BlockParser.js");



let lineParser = new LineParser();
let secondParser = new SecondParser();
let sensorParser = new SensorParser();
let consoleWriter = new ConsoleWriter();
let blockParser = new BlockParser();
//testStream.pipe(consoleWriter);


fs.createReadStream('ingest/F0.BIN')
    .pipe(blockParser);

//setTimeout(() => {}, 30000);

