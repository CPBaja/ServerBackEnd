const log = require(logger)("DataDispatcher");

class DataDispatcher {
    constructor(ws) {
        this.ws = ws; //WS that data will be sent to.
        this.dispatching = false; //Controls whether the dispatcher is activly sending data.

        //Stores runID that all data will be fetched from. Clients can only be fetching data from one runID at a time.
        this.runId = undefined;

        //Controls how fast the dispatcher polls the data request queue.
        this.pollInterval = 1; //TODO: Could be used for dynamic load balanceing at some point?

        //Controls grouping of points. A precentage of new point radius.
        //If time=.5, radius=.1, grouping=.1, any existing points from .5 +- .01 will essentially replace the point that would otherwise be sent
        this.grouping = .1; //10%

        //For reasons (im lazy/dum) the DB is searched in a range. This num is the precision around the actual time value to search.
        this.searchPrecision = .5;

        //Holds data requests queued for send.
        this.sendQueue = [];

        //Holds objects describing what client has already recieved.
        /*
        {
            time: n,
            realTime: n, //Time actually recieved from database might differ to calculated time val.

        }
        */
        this.clientLoaded = [];

        //The timeout/timer that controls when the next dispatch will be run.
        this.timer = null;

        //Stops the dispatcher on WS close.
        ws.on("close", this.stop.bind(this));
        ws.on("error", this.stop.bind(this));

        this.start(); //Start the dispatcher.
    }

    set RunId(runId) {
        this.runId = runId;

    }

    stop() {
        this.dispatching = false;
    }

    start() {
        this.dispatching = true;
        this.attemptDispatch().catch(err => log.error(err)); //Start the dispatcher running.
    }

    setFrame(timeFrame, density, sensors) {

        if (this.runId === undefined) {
            this.ws.sendError("No run ID has been specified!");
            log.warn("Client attempted to get data without setting a run ID beforehand!");
            return;
        }
        this.queuePoints(timeFrame, density, timeFrame[1] - timeFrame[0], sensors); //Queue the points for eventual dispatch.
    }

    //Updates the send queue with points for the most recent frame.
    queuePoints(timeFrame, density, timeRange, sensors) {
        const interval = timeRange / density;
        const radius = interval / 2;
        const lowTimeBound = Math.floor(timeFrame[0] / interval) * interval;

        //Holds generated points while they're being calculated.
        let newQueue = [];
        for (let i = 0; i < density; i++) {
            newQueue.push({
                time: i * interval + lowTimeBound,
                sensors: sensors,
                radius: radius,
                runId: this.runId,
                timeMicros: (i * interval + lowTimeBound) * 1000000,
                radiusMicros: radius * 1000000,
            });
        }

        //Remove any points that the client has already recieved and should have loaded.
        //Will remove if there is a loaded point +- grouping% already loaded client side.
        newQueue = newQueue.filter(
            v => !this.clientLoaded.find(
                w => {
                    const lowerBound = v.time - v.radius * this.grouping;
                    const upperBound = v.time + v.radius * this.grouping;
                    return w.time >= lowerBound && w.time <= upperBound;
                })
        );
        //console.log(newQueue);
        this.sendQueue = newQueue;
    }

    setRunId(newId) {
        this.runId = newId;
    }

    async attemptDispatch() {
        //log.info("dispatching");
        if (this.sendQueue && this.sendQueue.length > 0) {
            let toSend = this.sendQueue.shift();

            let res = await DB.cRuns.find({
                    id: 0,
                    time: {
                        $lte: toSend.timeMicros + toSend.radiusMicros * this.searchPrecision,
                        $gte: toSend.timeMicros - toSend.radiusMicros * this.searchPrecision,
                    }
                }
            ).limit(1).toArray();
            //console.log(toSend.timeMicros + toSend.radiusMicros * .1);
            //console.log(res);
            if (res[0]) { //We got a result, send it.
                const recObj = {...res[0]}; //Copy the obj to modify it.
                const sensors = Object.keys(recObj)
                    .filter(v => isNumeric(v))
                    .reduce((res, key) => Object.assign(res, { [key]: recObj[key] }), {} );

                const sendObj = {
                    data: sensors,
                    time: toSend.time, //Convert the micros to seconds for sending. //TODO: SEND ACTUAL TIME, OR CALCULATED TIME???
                    realTime: false, //TODO: IMPLEMENT REALTIME!!!!!!!!!
                    radius: toSend.radius,
                };

                await this.ws.sendObject("dataRequest", sendObj);
            }

            this.clientLoaded.push({ //Push anyways,
                realTime: res[0] ? res[0].time / 1000000 : toSend.time,
                time: toSend.time
            });
        }

        if (this.dispatching) {
            this.timer = setTimeout(this.attemptDispatch.bind(this), this.pollInterval);
        }

    }

}

module.exports = DataDispatcher;

//Stack overflow to the rescue :)
function isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
}