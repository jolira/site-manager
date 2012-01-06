/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
function configure(server, repo, callback) {
  repo.load(function(err, content) {
    if (err) {
        return callback(err);
    }
    content.forEach(function(file){
    });
    callback();
  });
}

function Launcher(connect, repo) {
  this.connect = connect;
  this.repo = repo;
}

Launcher.prototype.start = function(callback) {
  var self = this;
  var logger = this.connect.logger();
  this.server = this.connect.createServer(logger);
  configure(this.server, this.repo, function() {
    self.server.listen(3e3);
    callback();
  });
};

Launcher.prototype.stop = function(callback) {
  if (this.server) {
    this.server.close();
    delete this.server;
  }
  callback();
};

module.exports = Launcher;