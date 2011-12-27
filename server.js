/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var connect = require('connect');
var Manager = require('./lib/manager');
var manager = new Manager(connect);

function handleError(err) {
  if (err) {
    console.log(err.stack || err);
    process.exit(-1);
  }
}

process.on("uncaughtException", function(err) {
  console.log(err.stack || err);
  manager.restart(function(err){
    handleError(err);
    console.log("Restarted...");
  });
});

process.on("SIGINT", function() {
  console.log("Shutting down...");
  manager.stop(function(err){
    handleError(err);
    process.exit(0);
  });
});

manager.start(function(err) {
  handleError(err);
  console.log("Started...");
});
