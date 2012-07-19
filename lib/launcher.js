/*jslint white: false, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var LOG_STRING = ':remote-addr - - [:date] :req[host]  ":method :url HTTP/:http-version" :status ' +
            ':res[content-length] ":referrer" ":user-agent"',
        fs = require("fs"),
        Batch = require('batch'),
        http = require('http'),
        https = require('https'),
        cluster = require('cluster'),
        startSte = require("./site"),
        logger = require("./logger"),
        express = require("express"),
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

    function startSite(app, config, multiSite, cb, options) {
        var vsite = multiSite ? express.createServer() : app;

        return startSte(vsite, config, function (err, site) {
            if (err) {
                return cb(err);
            }

            if (multiSite) {
                if (app.secureApp) {
                    return cb(new Error("nulti-sites do not support https at this point."));
                }

                var vhost = express.vhost(site.module.hostname, vsite);

                app.use(vhost);
            }

            cb();
        }, options);
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

    function startSites(app, sites, multiSite, cb,  options) {
        var started = [],
            batch = new Batch();

        sites.forEach(function (config) {
            batch.push(function (done) {
                return startSite(app, config, multiSite, done, options);
            });
        });

        return batch.end(cb);
    }

    function Launcher(dir, logger) {
        this.dir = dir;
        this.apps = [];
        this.logger = logger;
    }

    function loadKeyCert(sslKeyFile, sslCertificateFile, cb) {
        var keyFile = sslKeyFile || path.join(__dirname, "..", "key.pem"),
            certFile = sslCertificateFile || path.join(__dirname, "..", "certificate.pem");

        return fs.readFile(keyFile, "utf-8", function (err, key) {
            if (err) {
                return cb(err);
            }
            return fs.readFile(certFile, "utf-8", function (err, certificate) {
                if (err) {
                    return cb(err);
                }

                return cb(undefined, { key: key, cert: certificate});
            });
        });
    }

    function createServer(logger, listenPort, sslPort, sslKey, sslCert, cb) {
        var batch = new Batch(),
            result = {
                logger: logger,
                app: express(),
                use: function(handler) {
                    if (this.secureApp) {
                        this.secureApp.use(handler);
                    }

                    return this.app.use(handler);
                }
            };

        batch.push(function(done){
            result.listenPort = listenPort;
            result.httpServer = http.createServer(result.app);
            result.httpServer.on("listening", done);
            result.httpServer.on("error", function (err) {
                return logger.error("http server error", err);
            });
            result.httpServer.listen(listenPort);
        });

        if (sslPort) {
            batch.push(function(done) {
                return loadKeyCert(sslKey, sslCert, function(err, credentials) {
                    if (err) {
                        return done(err);
                    }

                    result.sslPort = sslPort;
                    result.httpsServer = https.createServer(credentials, result.app);
                    result.httpsServer.on("listening", done);
                    result.httpsServer.on("error", function (err) {
                        return logger.error("https server error", err);
                    });
                    result.httpsServer.listen(sslPort);

                    return done();
                });
            });
        }

        batch.end(function(err) {
            return cb(err, result);
        });
    }

    Launcher.prototype.start = function (listenPort, sslPort, sslKey, sslCert, cb) {
        var self = this,
            home = getUserHome(),
            globalConfig = path.join(home, '.site-manager.json');

        return configLoader(globalConfig, function (err, properties) {
            if (err) {
                return cb(err);
            }

            logger.init({
                "aws-account-id":properties["aws-account-id"],
                "aws-access-key-id":properties["aws-access-key-id"],
                "aws-secret-access-key":properties["aws-secret-access-key"],
                "aws-region":properties["aws-region"],
                "aws-bucket":properties["aws-bucket"],
                "measure-interval": properties["measure-interval"],
                "application-name":"sitemanager"
            });
            logger("starting", globalConfig);

            return loadSites(self.dir, function (err, sites, multiSite) {
                if (err) {
                    return cb(err);
                }

                return createServer(self.logger, listenPort, sslPort, sslKey, sslCert, function(err, app) {
                    if (err) {
                        return cb(err);
                    }

                    self.logger("listening to", listenPort, sslPort);
                    self.apps.push(app);

                    var reqLogger = express.logger(LOG_STRING);

                    app.use(reqLogger);

                    return startSites(app, sites, multiSite, function (err, started) {
                        if (err) {
                            return cb(err);
                        }

                        self.started = started;

                        if (properties && properties.iscID && properties.iscKey) {
                            self.logger("reporting global 404s using", properties.iscID, properties.iscKey);
                            app.use(reporter(properties.iscID, properties.iscKey));
                        }

                        return cb();
                    }, properties);
                });
            }, self.logger);
        }, self.logger);
    };

    Launcher.prototype.stop = function (cb) {
        var self = this,
            batch = new Batch();

        this.apps.forEach(function (app) {
            batch.push(function (done) {
                app.httpServer.close();
                if (app.httpsServer) {
                    app.httpsServer.close();
                }
                done();
            });
        });
        batch.end(function () {
            self.apps = [];
            return cb && cb();
        });
    };

    module.exports = function (dir, logger) {
        return new Launcher(dir, logger);
    };
})(module);
