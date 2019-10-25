const stream = require("stream");

let rs = new stream.Readable();

let seed = 1;

let numTestSamples = 1000;

let maxPacketLength = 5;

let timeIncrmenet = 100;

let time = 0;

for(let i = 0; i < numTestSamples; i++){
    rs.push(`T:${i},ENG:${rsv()}:${rsv()},SUS:${rsv()}:${rsv()},ECVT:${rsv()}:${rsv()}:${rsv()}:T:arbitraryString,DRVR:T,`);
}
rs.push(null);


function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function rsv(){
    return Math.floor(random() * 1023);
}

module.exports = rs;