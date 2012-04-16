/*jslint white: false, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var LOG_STRING = ':remote-addr - - [:date] :req[host]  ":method :url HTTP/:http-version" :status ' +
            ':res[content-length] ":referrer" ":user-agent"',
        fs = require("fs"),
        _ = require("underscore"),
        debug = require("./debug"),
        startSte = require("./site"),
        connect = require("connect"),
        reporter = require("404project"),
        Batch = require("batch"),
        path = require("path");

    function startSite(app, config, multiSite, cb) {
        var vsite = multiSite ? connect.createServer() : app;

        startSte(vsite, config, function (err, site) {
            if (err) {
                return cb(err);
            }

            if (multiSite) {
                var vhost = connect.vhost(site.module.hostname, vsite);

                app.use(vhost);
            }

            cb();
        });
    }

    function resetRequireCache(siteDir) {
        var file = require.resolve(siteDir),
            dir = path.dirname(file),
            keys = Object.keys(require.cache);

        keys.forEach(function(key){
            if (key.indexOf(dir) === 0) {
                delete require.cache[key];
            }
        });

        delete require.cache[file];
    }

    function loadSite(dir, cb) {
        var siteDir = path.resolve(dir);

        debug("loading site", siteDir);

        fs.stat(path.join(siteDir, "package.json"), function (err) {
                if (err) {
                    return cb();
                }

                resetRequireCache(siteDir);

                var site = require(siteDir),
                    mySite = _.clone(site);

                return cb(err, mySite);
            });
    }

    function loadMultiSites(dir, cb) {
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
                if (0 === sites.length) {
                    return cb(new Error("no package.json files found in " + dir));
                }

                return cb(undefined, sites, true);
            });
        });
    }

    function loadSites(dir, cb) {
        debug("loading sites from", dir);

        loadSite(dir, function (err, site) {
            if (site) {
                return cb(undefined, [site]);
            }

            return loadMultiSites(dir, cb);
        });
    }

    function startSites(app, sites, multiSite, cb) {
        var started = [],
            batch = new Batch();

        sites.forEach(function (config) {
            batch.push(function (done) {
                return startSite(app, config, multiSite, done);
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

        return loadSites(self.dir, function (err, sites, multiSite) {
            if (err) {
                return cb(err);
            }

            var app = connect.createServer();
            var httpServer = app.listen(listenPort);
            var logger = connect.logger(LOG_STRING);

            app.use(logger);

            httpServer.on("error", function (err) {
                return cb(err);
            });
            httpServer.on("listening", function (err) {
                debug("listening to", listenPort);
                self.httpServers[listenPort] = httpServer;

                return startSites(app, sites, multiSite, function (err, started) {
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
