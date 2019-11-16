const log = require(logger)("WSData");

module.exports = (webSocketServer) => {
  webSocketServer.on("availableRunsRequest", (wss,ws) => {
      const query = {$or:[
              {Realtime: true},
              {Completed: true}
          ]};

      DB.cRunMeta.find(query).toArray()
          .then((runs) => {
              ws.sendObject("availableRuns", runs);
          });
  });

  webSocketServer.on("dataRequest", (wss, ws, data) => {
        /*Run Verification*/
      if(!(data.density || data.range || data.runId)){
          ws.sendError("Invalid data request! Missing density or range.");
          return;
      }
      ws.dispatcher.setFrame(data.range, data.density);
  });

};