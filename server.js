(function (exports, __dirname) {
  "use strict";

  var debug = require("./lib/debug");  
  var path = require("path");
  var launcher = require('./lib/launcher')(path.join(__dirname, "sites"));

  function handleError(err) {
    if (err) {
      console.error(err.stack || err);
      process.exit(-1);
    }
  }
  process.on("uncaughtException", function (err) {
    console.log(err.stack || err);
    launcher.restart(function (err) {
      handleError(err);
      debug("Restarted...");
    });
  });
  process.on("SIGINT", function () {
    debug("Shutting down...");
    launcher.stop(function (err) {
      handleError(err);
      process.exit(0);
    });
  });
  launcher.start(3e3, function (err) {
    handleError(err);
    debug("Started...");
  });
})(exports, __dirname);