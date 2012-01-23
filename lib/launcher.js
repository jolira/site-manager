/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var path = require('path');

function loadSite(connect, server, repo, site) {
  var siteFile = path.join(site, "site.json");
  repo.load(siteFile, function(err, content) {
    if (err) {
        throw err;
    }
    if (!content) {
      throw new Error("site definition file '" + siteFile + "' not found.");
    }
    var siteDefinition = JSON.parse(content);
    var vhost = connect.vhost(siteDefinition.hostname);

    server.use(vhost);
  });
}

function configure(connect, server, repo, callback) {
  repo.load(function(err, content) {
    if (err) {
        return callback(err);
    }
    content.forEach(function(site){
      loadSite(connect, server, repo, site);
    });
    callback();
  });
}

function Launcher(connect, repo, editor) {
  this.connect = connect;
  this.repo = repo;
  this.editor = editor;
}

Launcher.prototype.start = function(callback) {
  var self = this;
  var logger = this.connect.logger();
  this.server = this.connect.createServer(logger);
  configure(this.connect, this.server, this.repo, function() {
    self.server.use(self.editor);
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
