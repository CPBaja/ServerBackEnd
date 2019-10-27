const stream = require("stream");
const dataBufferLength = 1000;
const maxSensorsInPacket = 15;
const minBufferLength = maxSensorsInPacket * dataBufferLength;

const dataOffset = 5;
const readingLength = 2;

const constructingPackets = [];

let packetBuffer= new Buffer([]);

class BlockParser extends stream.Transform {
    constructor(options){
        super(options);
    }
    _transform(chunk, encoding, next){
        if(packetBuffer.length < minBufferLength){
            packetBuffer = Buffer.concat(pac)
        }
        console.log(`Time: ${chunk.readUInt32LE(0)}`);
        console.log(`Sensor: ${chunk.readUInt8(4)}`);
        for(let i = 0; i < 1000; i++){
            chu
        }
    }

}

module.exports = BlockParser;