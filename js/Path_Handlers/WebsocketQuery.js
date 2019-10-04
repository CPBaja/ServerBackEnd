const ip = require("ip");
const wssPort = process.env.WSS_PORT;

module.exports = (app) => {
  app.get("/ws", (req, res) =>{
     res.send(`ws://${ip.address()}:${wssPort}`);
  });
};