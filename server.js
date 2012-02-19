(function (exports, __dirname) {
  "use strict";

  var debug = require("./lib/debug");
  var path = require("path");

  function getSitesDirectory() {
    if (process.argv.length > 2) {
      return process.argv[2];
    }

    if (process.env.SITE_MANAGER_DIR) {
      return process.env.SITE_MANAGER_DIR;
    }

    return path.join(__dirname, "sites");
  }

  function getPort() {
    if (process.argv.length > 3) {
      return process.argv[3];
    }

    if (process.env.SITE_MANAGER_PORT) {
      return process.env.SITE_MANAGER_PORT;
    }

    return 3e3;
  }

  function getISCID() {
    if (process.argv.length > 4) {
      return process.argv[4];
    }

    if (process.env.ISC_ID) {
      return process.env.ISC_ID;
    }

    console.error("No ISC ID (DShield user id) specifed. Please register " +
      "at http://goo.gl/NUpFW and specify one using the ISC_ID environment " +
      "variable.");
  }

  function getISCKey() {
    if (process.argv.length > 5) {
      return process.argv[5];
    }

    if (process.env.ISC_KEY) {
      return process.env.ISC_KEY;
    }

    console.error("No ISC key specifed. Please register " +
      "at ttp://goo.gl/NUpFW and specify one using the ISC_KEY " +
      "envrionment variable.");
  }

  var sitesDir = getSitesDirectory();
  var port = getPort();
  var iscID = getISCID();
  var iscKey = getISCKey();
  var launcher = require('./lib/launcher')(sitesDir);

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
