/*jslint white: false, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var LOG_STRING = ':remote-addr - - [:date] :req[host]  ":method :url HTTP/:http-version" :status ' +
            ':res[content-length] ":referrer" ":user-agent"',
        fs = require("fs"),
        cluster = require('cluster'),
        startSte = require("./site"),
        connect = require("express"),
        reporter = require("404project"),
        Batch = require("batch"),
        path = require("path");

    function configLoader(file, cb, logger) {
        return fs.readFile(file, "utf-8", function(err, data) {
            if (err) {
                return cb();
            }

            var props = JSON.parse(data);

            logger("read properties", props, file);

            return cb(undefined, props);
        });
    }

    function getUserHome() {
        return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    }

    function startSite(app, config, multiSite, cb, options, logger, httpServer) {
        var vsite = multiSite ? connect.createServer() : app;

        return startSte(vsite, config, function (err, site) {
            if (err) {
                return cb(err);
            }

            if (multiSite) {
                var vhost = connect.vhost(site.module.hostname, vsite);

                app.use(vhost);
            }

            cb();
        }, options, logger, httpServer);
    }

    function resetRequireCache(siteDir) {
        var file = require.resolve(siteDir),
            dir = path.dirname(file),
            keys = Object.keys(require.cache);

        keys.forEach(function (key) {
            if (key.indexOf(dir) === 0) {
                delete require.cache[key];
            }
        });

        delete require.cache[file];
    }

    function loadSite(siteDir, cb, logger) {
        logger("loading site", siteDir);

        return fs.stat(path.join(siteDir, "package.json"), function (err) {
            if (err) {
                return cb();
            }

            configLoader(path.join(siteDir, '.config.json'), function (err, properties) {
                if (err) {
                    return cb(err);
                }

                if (!cluster.isWorker) {
                    resetRequireCache(siteDir);
                }

                return cb(err, {
                    site: require(siteDir),
                    properties: properties
                });
            }, logger);
        });

    }

    function loadMultiSites(dir, cb, logger) {
        return fs.readdir(dir, function (err, files) {
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
                        }, logger);
                    };
                })(siteDir));
            });
            return batch.end(function (err) {
                if (0 === sites.length) {
                    return cb(new Error("no package.json files found in " + dir));
                }

                return cb(undefined, sites, true);
            });
        });
    }

    function loadSites(dir, cb, logger) {
        var siteDir = path.resolve(dir);

        logger("loading sites from", siteDir);

        loadSite(siteDir, function (err, site) {
            if (site) {
                return cb(undefined, [site]);
            }

            return loadMultiSites(siteDir, cb, logger);
        }, logger);
    }

    function startSites(app, sites, multiSite, cb,  options, logger, httpServer) {
        var started = [],
            batch = new Batch();

        sites.forEach(function (config) {
            batch.push(function (done) {
                return startSite(app, config, multiSite, done, options, logger, httpServer);
            });
        });

        return batch.end(cb);
    }

    function Launcher(dir, logger) {
        this.dir = dir;
        this.httpServers = {};
        this.logger = logger;
    }

    Launcher.prototype.start = function (listenPort, cb) {
        if (this.httpServers[listenPort]) {
            return cb(new Error("already started"));
        }

        var self = this,
            home = getUserHome(),
            globalConfig = path.join(home, '.site-manager.json');

        return configLoader(globalConfig, function (err, properties) {
            if (err) {
                return cb(err);
            }

            return loadSites(self.dir, function (err, sites, multiSite) {
                if (err) {
                    return cb(err);
                }

                var app = connect.createServer(),
                    httpServer = app.listen(listenPort),
                    logger = connect.logger(LOG_STRING);

                app.use(logger);

                httpServer.on("error", function (err) {
                    return cb(err);
                });
                httpServer.on("listening", function (err) {
                    self.logger("listening to", listenPort);
                    self.httpServers[listenPort] = httpServer;

                    return startSites(app, sites, multiSite, function (err, started) {
                        if (err) {
                            return cb(err);
                        }

                        self.started = started;

                        if (properties && properties.iscID && properties.iscKey) {
                            self.logger("reporting global 404s using", properties.iscID, properties.iscKey);
                            app.use(reporter(properties.iscID, properties.iscKey));
                        }

                        var icon = connect.favicon();

                        app.use(icon);

                        return cb();
                    }, properties, self.logger, httpServer);
                });
            }, self.logger);
        }, self.logger);
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

                self.logger("closing ", port);
                server.close();

                delete self.httpServers[port];
                done();
            });
        });
        batch.end(function () {
            self.logger("still running", self.httpServers);
            return cb && cb();
        });
    };

    module.exports = function (dir, logger) {
        return new Launcher(dir, logger);
    };
})(module);
