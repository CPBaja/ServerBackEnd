const stream = require("stream");
const dataBufferLength = 1000;
const numSensors = 10;

const minBufferLength = 21000;

const dataOffset = 5;
const readingLength = 2;


class BinParser extends stream.Transform {
    constructor(options) {
        super({objectMode: true});
        this.packetBuffer = undefined;
    }

    //transforms streams of binary into stream of sensor objects:
    /*
    {
        time: ,
        sensId: value,
        sensId1: value1,
        sensId2: value2,
    }
     */
    _transform(chunk, encoding, next) {
        this.packetBuffer = this.packetBuffer ? Buffer.concat([this.packetBuffer, chunk]) : chunk;

        while (this.packetBuffer.length > minBufferLength) { //We (hopefully :/) have enough data to parse a full packet

            let parsedPackets = [];
            for (let i = 0; i < dataBufferLength; i++) { //Init packet objects
                parsedPackets[i] = {sensors: {}};
            }

            /*Init done, start reading operations*/
            let startTime = this.readUInt32();
            for (let i = 0; i < numSensors; i++) {
                let identifier = this.readUInt8();
                for (let i = 0; i < dataBufferLength; i++) {
                    parsedPackets[i].sensors[identifier] = this.readUInt16();
                }
            }
            let finishTime = this.readUInt32();
            parsedPackets.forEach((v, i) => v.time = Math.round(this.map(i, 0, dataBufferLength, startTime, finishTime)));
            parsedPackets.forEach(v => this.push(v));
        }
        next();
    }

    readUInt32(){
        let val = this.packetBuffer.readUInt32LE(0);
        this.packetBuffer = this.packetBuffer.slice(4);
        return val;
    }

    readUInt16(){
        let val = this.packetBuffer.readUInt16LE(0);
        this.packetBuffer = this.packetBuffer.slice(2);
        return val;
    }

    readUInt8(){
        let val = this.packetBuffer.readUInt8(0);
        this.packetBuffer = this.packetBuffer.slice(1);
        return val;
    }

    map(num, in_min, in_max, out_min, out_max){ //Maps the given function from the first range to the second
        return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

}



module.exports = BinParser;