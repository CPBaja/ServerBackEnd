const stream = require("stream");
let log = require(logger)("Sensor Parser");


class SensorParser extends stream.Transform {
    constructor(options) {
        super({objectMode: true});
    }

    _write(line, encoding, next) {
        try {

            let rawArr = (line + '').split(':');
            //console.log(rawArr);
            let sensorChar = rawArr[0];
            if (!isNaN(sensorChar)) {
                log.warn("Unable to parse line into sensor.");
                next();
                return;
            } //If we have a number in the first spot of the array, the format's been broken. Throw it away.
            rawArr.shift(); //shift the first part out (the sensor char) and start parsing times+values
            let sensorReadings = []; //Contains objects in form {time, value}
            for (let i = 0; i < rawArr.length; i += 2) { //Increment by two.
                sensorReadings.push({time: rawArr[i+1], value:rawArr[i]});
            }
            this.push({char: sensorChar, readings: sensorReadings});
            next();
            //console.log(sensorReadings);


        } catch (e) {
            console.log(e);
            next();
        }


    }

}

module.exports = SensorParser;