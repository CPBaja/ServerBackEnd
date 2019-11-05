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

  });

};