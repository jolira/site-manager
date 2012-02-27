/*jslint white: false, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var LOG_STRING = ':remote-addr - - [:date] :req[host]  ":method :url HTTP/:http-version" :status ' +
            ':res[content-length] ":referrer" ":user-agent"',
        fs = require("fs"),
        debug = require("./debug"),
        startSite = require("./site"),
        connect = require("connect"),
        reporter = require("404project"),
        Batch = require("batch"),
        path = require("path");

    function loadSite(siteDir, cb) {
        fs.readFile(path.join(siteDir, "package.json"), "utf8",
            function (err) {
                if (err) {
                    return cb();
                }

                var site = require(siteDir);

                return cb(err, site);
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

            var sites = [],
                batch = new Batch();

            files.forEach(function (file) {
                var siteDir = path.join(dir, file);

                batch.push((function (siteDir) {
                    return function (done) {
                        return loadSite(siteDir, function (err, site) {
                            if (site) {
                                sites.push(site);
                            }
                            done();
                        });
                    };
                })(siteDir));
            });
            batch.end(function (err) {
                if (sites.length === 0) {
                    return cb(new Error("no package.json files found in " + dir));
                }

                return cb(undefined, sites);
            });
        });
    }

    function startSites(app, sites, cb) {
        var started = [],
            batch = new Batch();

        sites.forEach(function (_site) {
            batch.push(function (done) {
                return startSite(app, _site, done);
            });
        });

        return batch.end(cb);
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

            var app = connect.createServer(connect.logger(LOG_STRING));

            app.listen(listenPort);
            debug("listening to", listenPort);
            self.apps[listenPort] = app;

            return startSites(app, sites, function (err, started) {
                if (err) {
                    return cb(err);
                }

                self.started = started;

                if (iscID && iscKey) {
                    debug("reporting global 404s using", iscID, iscKey);
                    app.use(reporter(iscID, iscKey));
                }

                var icon = connect.favicon();

                app.use(icon);

                return cb(undefined);
            });
        });
    };

    Launcher.prototype.stop = function (/*[port1 [, port2 [, …]]], cb*/) {
        var self = this,
            batch = new Batch(),
            ports = [],
            idx,
            cb;

        for (idx in arguments) {
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

        ports.forEach(function (port) {
            debug("stopping port " + port);

            batch.push(function (done) {
                var app = self.apps[port];

                app.close();

                delete self.apps[port];
                done();
            });
        });
        batch.end(function () {
            debug("still running", self.apps);
            return cb && cb();
        });
    };

    module.exports = function (dir) {
        return new Launcher(dir);
    };
})(module);
