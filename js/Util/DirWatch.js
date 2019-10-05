const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

class DirWatch extends EventEmitter{
    constructor(directory){
        super();
        fs.watch(directory, {},(eventType, fileName) => {
            if(eventType === "rename"){ //Fired when file added/removed/renamed in tiles. Used to keep index updated.
                //File was added
                if(fs.existsSync(path.join(directory, fileName))) {
                    this.emit("added", fileName);
                } //File removed
                else if (!fs.existsSync(path.join(directory, fileName))) {
                    this.emit("removed", fileName);
                }
            }
        });
    }
}

module.exports = DirWatch;