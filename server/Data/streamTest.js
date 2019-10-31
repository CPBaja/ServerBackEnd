const fs = require("graceful-fs");

const LineParser = require("./Pipes/LineParser.js");
const SecondParser = require("./Pipes/SecondParser.js");
const SensorParser = require("./Pipes/SensorParser.js");
const ConsoleWriter = require("./Pipes/ConsoleWriter.js");
const BlockParser = require("./Pipes/BlockParser.js");
const CSVWriter = require("./Pipes/CSVWriter.js");
const DbWriter = require("./Pipes/dbWriter");


let dbWriter = new DbWriter();
let lineParser = new LineParser();
let secondParser = new SecondParser();
let sensorParser = new SensorParser();
let consoleWriter = new ConsoleWriter();
let blockParser = new BlockParser();
let csvWriter = new CSVWriter();
//testStream.pipe(consoleWriter);

let out = fs.createWriteStream("csvOut.csv");

fs.createReadStream('ingest/F0.BIN').pipe(blockParser).pipe(dbWriter);

//setTimeout(() => {}, 30000);

