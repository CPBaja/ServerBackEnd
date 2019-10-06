const low = require("lowdb");
const FileAsync = require('lowdb/adapters/FileAsync');

const adapter = new FileAsync("db.json");
let db = low(adapter);
