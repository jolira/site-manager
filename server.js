/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var connect = require('connect');
var repo = require('./lib/repo');
var Launcher = require('./lib/launcher');
var launcher = new Launcher(connect, repo);

function handleError(err) {
  if (err) {
    console.log(err.stack || err);
    process.exit(-1);
  }
}
process.on("uncaughtException", function (err) {
  console.log(err.stack || err);
  launcher.restart(function (err) {
    handleError(err);
    console.log("Restarted...");
  });
});
process.on("SIGINT", function () {
  console.log("Shutting down...");
  launcher.stop(function (err) {
    handleError(err);
    process.exit(0);
  });
});
launcher.start(function (err) {
  handleError(err);
  console.log("Started...");
});