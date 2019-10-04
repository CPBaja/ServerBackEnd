const express = require("express");
const fs = require("fs");
const path = require("path");

const port = process.env.HTTP_PORT;
const pathHandlerRoot = `${appRoot}/js/Path_Handlers/`;
const errorPageHandler = `${appRoot}/js/Error_Handlers/404.js`;

let app = express();
app.use(express.json());

//Discover + allow path handlers to register with the express app
console.log("Registering HTTP Path Handlers:");
let files = fs.readdirSync(pathHandlerRoot);
files.forEach((v) => {
    let h = require(pathHandlerRoot + v);
    console.log(`\tRegistering ${v}`);
    h(app); //Allow each handler to init by passing the express app.
});

//Register 404 as the last handler to catch requests that don't find anything.
require(errorPageHandler)(app);

app.listen(port, () => console.log(`App listening on port ${port}!`));