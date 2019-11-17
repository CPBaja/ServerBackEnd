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
      if(!(data.density || data.range)){
          ws.sendError("Invalid data request! Missing density or range.");
          return;
      }

      //!== undefined because JS FUCKING TYPE COERSION! 0 is false, but is valid val for us.
      if(data.runId !== undefined){ws.dispatcher.setRunId(data.runId)}
      ws.dispatcher.setFrame(data.range, data.density);
  });

};