/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
/**
 * Create a new manager.
 * @param connect the connect object to be used by the manager
 */

function Launcher(connect) {
  this.connect = connect;
}
/**
 * Start the manager.
 * @param callback the method to be called when the server started.
 */
Launcher.prototype.start = function (callback) {
  var logger = this.connect.logger();
  this.app = this.connect.createServer(logger);
  this.app.listen(3000);
  callback();
};

Launcher.prototype.stop = function (callback) {
  if (this.app) {
    this.app.close();
    delete this.app;
  }
  callback();
};


module.exports = Launcher;