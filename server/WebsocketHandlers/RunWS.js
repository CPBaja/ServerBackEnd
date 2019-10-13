module.exports = (webSocketServer) => {
  webSocketServer.on("availableRunRequest", (wss,ws,data) => {
      ws.sendObject("availableRunResponse", {
         runs: ["Lel"]
      });
  });

};