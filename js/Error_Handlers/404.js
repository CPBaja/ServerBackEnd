/*
Handles 404 errors. Registers a wildcard at the very end of all other handlers, acting as a fallback.
Currently serves a static 404.html file.
 */
const path = require("path");

module.exports = (app) => {
  app.get("*", (req, res) => {
      res.sendFile("404.html", {root:path.join(appRoot, "www")});
  });
};