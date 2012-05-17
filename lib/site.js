/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var path = require("path"),
        debug = require("./debug"),
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

    function Site(mod) {
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

    Site.prototype.start = function (site, cb) {
        if (!this.module.hostname) {
            return cb(new Error("no hostname defined for module " + this.module));
        }

        var self = this;

        site.use(connect.compress({
            /* TODO: filter: function () {
             return true; // compress it all
             }*/
        }));

        var publicDirs = self.module["public"];

        site.use(less(publicDirs, {
            maxAge: 86400000
        }));

        if (self.module.dispatcher) {
            site.use(dispatcher(self.module.dispatcher));
        }

        site.use(htmlcompiler(self.module));

        locate(publicDirs, "favicon.ico", function (err, icon) {
            if (err) {
                return cb(err);
            }

            debug(self.module.hostname, "using", icon);
            site.use(connect.favicon(icon));

            locate(self.module["public"], "manifest.appcache", function (err, manifestFile) {
                if (err) {
                    return cb(err);
                }

                debug(self.module.hostname, "using", manifestFile);
                site.use(manifest(manifestFile, {
                    maxAge: 86400000
                }));
                startStaticEtc(self, site, cb);
            });
        });
    };

    function startSite(site, cb, globalOptions, app) {
        if (typeof site.site === "function") {
            var clonedDefaults = clone(defaults);

            return site.site(clonedDefaults, cb, site.properties, globalOptions, app);
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

            var site = new Site(conf);

            return site.start(app, cb);
        }, options, app);
    };
})(module, __dirname);
