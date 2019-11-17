const log = require(logger)("DataDispatcher");

class DataDispatcher {
    constructor(ws) {
        this.ws = ws; //WS that data will be sent to.
        this.dispatching = false; //Controls whether the dispatcher is activly sending data.

        //Stores runID that all data will be fetched from. Clients can only be fetching data from one runID at a time.
        this.runId = undefined;

        //Controls how fast the dispatcher polls the data request queue.
        this.pollInterval = 1000; //TODO: Could be used for dynamic load balanceing at some point?

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

    start(){
        this.dispatching = true;
        this.attemptDispatch(); //Start the dispatcher running.
    }

    setFrame(timeFrame, density, sensors) {

        if(this.runId === undefined){this.ws.sendError("No run ID has been specified!"); log.warn("Client attempted to get data without setting a run ID beforehand!"); return;}
        this.queuePoints(timeFrame, density,timeFrame[1] - timeFrame[0], sensors); //Queue the points for eventual dispatch.
    }

    //Updates the send queue with points for the most recent frame.
    queuePoints(timeFrame, density, timeRange, sensors) {
        const interval = timeRange / density;
        const radius = interval/2;
        const lowTimeBound = Math.floor(timeFrame[0]/interval) * interval;

        //Holds generated points while they're being calculated.
        let newQueue = [];
        for(let i = 0; i < density + 1; i++){
            newQueue.push({
                time: i * interval + lowTimeBound,
                sensors: sensors,
                radius: radius,
                runId: this.runId,
            });
        }

        //Remove any points that the client has already recieved and should have loaded. //TODO: COULD BE IMPROVED WITH RANGE INSTeAD OF EXACT POINT MATCHING.
        newQueue = newQueue.filter(v => !this.clientLoaded.find(w => w.time === v.time));
        console.log(newQueue);

        this.sendQueue = newQueue;
    }

    setRunId(newId){
        this.runId = newId;
    }

    async attemptDispatch(){
        //log.info("dispatching");
        if(this.sendQueue && this.sendQueue.length > 0){
            let toSend = this.sendQueue.shift();
            this.ws.sendObject("dataRequest", {time: toSend.time});
            this.clientLoaded.push({
               time: toSend.time
            });
        }

        if(this.dispatching){
            this.timer = setTimeout(this.attemptDispatch.bind(this), this.pollInterval);
        }

    }

}

module.exports = DataDispatcher;