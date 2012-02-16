(function (module) {
  "use strict";

  var fs = require("fs");
  var debug = require("./debug");
  var _ = require("underscore");
  var path = require("path");

  function loadSite(siteDir, cb) {
    var siteFile = path.join(siteDir, "package.json");
    
    return fs.readFile(siteFile, "utf8", function(err, data){
      if (err) {
        debug("error reading ", siteFile, err);
        return cb(undefined);
      }
      
      var site = JSON.parse(data);
      
      site.launcher = require(siteDir);
      
      return cb(site);
    });
  }

  function loadSites(dir, cb) {
    debug("loading sites from", dir);
    
    fs.readdir(dir, function(err, files) {
      if (err) {
        return cb(err);
      }
      
      if (files.length === 0) {
        return cb(new Error("no sites found in " + dir));
      }
      
      var sites = [];
      var _cb = _.after(files.length, function(sites){
        if (sites.length === 0) {
          return cb(new Error("no site.json files found in " + dir));
        }

        return cb(undefined, sites);
      });

      files.forEach(function(file){
        var siteDir = path.join(dir, file);

        return loadSite(siteDir, function(site){
          if (site) {
            sites.push(site);
          }

          return _cb(sites);
        });
      });
    });
  }
  
  function startSites(sites, cb) {
    return cb(undefined, sites);
  }

  function Launcher(dir) {
    this.dir = dir;
  }

  Launcher.prototype.start = function (cb) {
    var self = this;

    return loadSites(self.dir, function (err, sites) {
      if (err) {
        return cb(err);
      }
      
      debug("sites found:", sites);

      return startSites(sites, function (err, started) {
        if (err) {
          return cb(err);
        }
        self.started = started;
        return cb(undefined);
      });
    });
  }

  module.exports = function (dir) {
    return new Launcher(dir);
  }
})(module);
