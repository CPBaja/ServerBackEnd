class DataDispatcher {
    constructor(ws) {
        this.ws = ws;
        this.timeFrame = [0, 0];
        this.timeRange = 0;
        this.density = [0, 0];
        this.runId = 0;

        this.inputQueue = [];

    }

    set RunId(runId) {
        this.runId = runId;

    }

    setFrame(timeFrame, density, sensors) {
        this.timeFrame = timeFrame;
        this.timeRange = timeFrame[1] - timeFrame[0];
        this.density = density;
    }

    queuePoints() {
        const interval = this.density/this.timeRange;
        const radius = interval/2;
        const lowTimeBound = Math.floor(this.timeFrame[0]/interval) * interval;
        const newQueue = [];
        for(let i = 0; i < this.density + 1; i++){
            newQueue[i] = {

            }
        }
    }

}

module.exports = DataDispatcher;