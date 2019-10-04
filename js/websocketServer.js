const Websocket = require("ws");

const wssPort = process.env.WSS_PORT;
const wss = new Websocket.Server({port:81});

global["wss"] = wss;

wss.on("connection", (ws) => {
   ws.on("message", (message) => {
       handleMessage(ws, message);
   });
});

function handleMessage(ws, message){
    console.log(message);

}
console.log("WebSocket listening at port 81!");
//TODO: MAKE WS HANDLERS MODULAR LIKE HTTP ONES.