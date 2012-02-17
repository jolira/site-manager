(function (exports, __dirname) {
  "use strict";

  var debug = require("./lib/debug");  
  var path = require("path");
  var launcher = require('./lib/launcher')(path.join(__dirname, "sites"));

  var port = process.argv.length > 2 ? process.argv[2] : 3e3;
  var iscID = process.argv.length > 3 ? process.argv[3] : undefined;
  var iscKey = process.argv.length > 4 ? process.argv[4] : undefined;

  debug("command-line", port, iscID, iscKey);

  function handleError(err) {
    if (err) {
      console.error(err.stack || err);
      process.exit(-1);
    }
  }
  process.on("uncaughtException", function (err) {
    console.error(err.stack || err);
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
  launcher.start(port, iscID, iscKey, function (err) {
    handleError(err);
    debug("Started...");
  });
})(exports, __dirname);