(function (module) {
  "use strict";

  var fs = require("fs");
  var debug = require("./debug");
  var startSite = require("./site");
  var _ = require("underscore");
  var connect = require("connect");
  var reporter = require("404project");
  var path = require("path");

  function loadSite(siteDir, cb) {
    fs.readFile(path.join(siteDir, "package.json"), "utf8",
      function(err, data) {
        if (err) {
          return cb();
        }

        var site = require(siteDir);

        return cb(site);
    });
  }

  function loadSites(dir, cb) {
    debug("loading sites from", dir);

    fs.readdir(dir, function (err, files) {
      if (err) {
        return cb(err);
      }

      if (files.length === 0) {
        return cb(new Error("no sites found in " + dir));
      }

      var sites = [];
      var _cb = _.after(files.length, function (sites) {
        if (sites.length === 0) {
          return cb(new Error("no package.json files found in " + dir));
        }

        return cb(undefined, sites);
      });

      files.forEach(function (file) {
        var siteDir = path.join(dir, file);

        return loadSite(siteDir, function (site) {
          if (site) {
            sites.push(site);
          }

          return _cb(sites);
        });
      });
    });
  }

  function startSites(app, sites, cb) {
    var started = [];
    var _cb = _.after(sites.length, function (started) {
      return cb(undefined, started);
    });

    sites.forEach(function(_site){
      return startSite(app, _site, function(err, site){
        if (err) {
          return cb(err, started);
        }

        started.push(site);
        _cb(started);
      });
    });

    return cb(undefined, sites);
  }

  function Launcher(dir) {
    this.dir = dir;
    this.apps = {};
  }

  Launcher.prototype.start = function (listenPort, iscID, iscKey, cb) {
    if (this.apps[listenPort]) {
     return cb(new Error("already started"));
    }

    var self = this;

    return loadSites(self.dir, function (err, sites) {
      if (err) {
        return cb(err);
      }

      debug("sites found:", sites);
      var app = connect.createServer(connect.logger());

      return startSites(app, sites, function (err, started) {
        if (err) {
          return cb(err);
        }

        self.started = started;

        if (iscID && iscKey) {
            debug("reporting global 404s");
            app.use(reporter(iscID, iscKey));
        }

        app.listen(listenPort);
        debug("listening to", listenPort);
        self.apps[listenPort] = app;

        return cb(undefined);
      });
    });
  };

  Launcher.prototype.stop = function(/*[port1 [, port2 [, …]]], cb*/) {
    var ports = [];
    var cb;

    for (var idx in arguments) {
      if (cb) {
        ports.push(cb);
      }
      cb = arguments[idx];
    }

    var allActivePorts = Object.keys(this.apps);

    if (allActivePorts.length === 0) {
      return cb && cb(new Error("nothing to stop as there are no " +
        "active ports"));
    }

    if (ports.length === 0) {
      // stop all
      ports = allActivePorts;
    }

    var _cb = _.after(ports.length, function () {
      debug("still running", self.apps);
      return cb && cb(undefined);
    });

    var self = this;
    ports.forEach(function(port){
      debug("stopping port " + port);

      var app = self.apps[port];

      app.close();

      delete self.apps[port];

      return _cb();
    });
  };

  module.exports = function (dir) {
    return new Launcher(dir);
  };
})(module);
