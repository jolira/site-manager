/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var path = require("path"),
        clone = require("./util").clone,
        locate = require('./util').locate,
        less = require("connect-less-jolira"),
        htmlcompiler = require("./htmlcompiler"),
        dispatcher = require("./dispatcher"),
        manifest = require("./manifest"),
        defaults = require("./defaults"),
        connect = require("connect"),
        url = require("url"),
        fs = require("fs");

    function Site(mod, logger) {
        this.logger = logger;
        this.module = mod;
    }

    function startStaticEtc(self, site, cb) {
        /*
         * Load static files
         */
        var publicDirs = self.module["public"];

        publicDirs.forEach(function (dir) {
            var siteOpts = clone(self.module.staticOptions),
                siteSvr = connect["static"](dir, siteOpts);

            site.use(siteSvr);
        });

        cb(undefined, self);
    }

    Site.prototype.start = function (app, cb) {
        if (!this.module.hostname) {
            return cb(new Error("no hostname defined for module " + this.module));
        }

        if (this.module.tailingScripts) {
            return cb(new Error("tailingScripts has been renamed to trailingScripts; please change your code"));
        }

        var self = this;

        app.use(connect.compress({
            /* TODO: filter: function () {
             return true; // compress it all
             }*/
        }));

        var publicDirs = self.module["public"];

        app.use(less(publicDirs, {
            maxAge: 86400000
        }, self.logger));

        if (self.module.dispatcher) {
            app.use(dispatcher(self.module.dispatcher, self.logger));
        }

        app.use(htmlcompiler(self.module, self.logger));

        locate(publicDirs, "favicon.ico", function (err, icon) {
            if (err) {
                return cb(err);
            }

            self.logger.debug(self.module.hostname, "using", icon);
            app.use(connect.favicon(icon));
            app.use(manifest(self.module, {
                maxAge: 86400000
            }, self.logger));
            startStaticEtc(self, app, cb);
        });
    };

    function startSite(site, cb, globalOptions, app) {
        if (typeof site.site === "function") {
            var _defaults = clone(defaults);

            return site.site(_defaults, cb, site.properties, globalOptions, app);
        }

        var mySite = clone(site.site),
            props = Object.keys(defaults);

        props.forEach(function (prop) {
            if (!(prop in mySite)) {
                mySite[prop] = defaults[prop];
                return;
            }

            if (prop === 'public') {
                if (!Array.isArray(mySite[prop])) {
                    mySite[prop] = [mySite[prop]];
                }

                defaults[prop].forEach(function (dir) {
                    mySite[prop].push(dir);
                });
            }
        });

        return cb(undefined, mySite);
    }

    module.exports = function (app, mod, cb, options) {
        startSite(mod, function (err, conf) {
            if (err) {
                return cb(err);
            }

            var site = new Site(conf, app.logger);

            return site.start(app, cb);
        }, options, app);
    };
})(module, __dirname);
