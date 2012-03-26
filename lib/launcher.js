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

    function loadSite(dir, cb) {
        var siteDir = path.resolve(dir);

        debug("loading site", siteDir);

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
        this.httpServers = {};
    }

    Launcher.prototype.start = function (listenPort, iscID, iscKey, cb) {
        if (this.httpServers[listenPort]) {
            return cb(new Error("already started"));
        }

        var self = this;

        return loadSites(self.dir, function (err, sites) {
            if (err) {
                return cb(err);
            }

            var app = connect.createServer(connect.logger(LOG_STRING));
            var httpServer = app.listen(listenPort);

            debug("listening to", listenPort);
            self.httpServers[listenPort] = httpServer;

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

                return cb();
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

        var allActivePorts = Object.keys(this.httpServers);

        if (allActivePorts.length === 0) {
            return cb && cb(new Error("nothing to stop as there are no " +
                "active ports"));
        }

        if (ports.length === 0) {
            // stop all
            ports = allActivePorts;
        }

        ports.forEach(function (port) {
            batch.push(function (done) {
                var server = self.httpServers[port];

                debug("closing ", port);
                server.close();

                delete self.httpServers[port];
                done();
            });
        });
        batch.end(function () {
            debug("still running", self.httpServers);
            return cb && cb();
        });
    };

    module.exports = function (dir) {
        return new Launcher(dir);
    };
})(module);
