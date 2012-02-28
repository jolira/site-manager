/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var HTTP_SUCCESS = 200,
        HTTP_INTERNAL_ERROR = 500,
        path = require("path"),
        MODULE_HOME = path.join(__dirname, ".."),
        TEMPLATES_DIR = path.join(MODULE_HOME, "templates"),
        INDEX_FILE = path.join(TEMPLATES_DIR, "index.html"),
        PUBLIC_DIR = path.join(MODULE_HOME, "public"),
        debug = require("./debug"),
        hbars = require("handlebars"),
        connect = require("connect"),
        _ = require("underscore"),
        fs = require("fs");

    function getSiteDefaults() {
        return {
            /**
             * The fully qualified path of the index file (or a function that loads it)
             */
            "index":INDEX_FILE,
            /**
             * The options to be passed to connect.static
             */
            "staticOptions":{ /* maxAge: oneDay */ },
            /**
             *    {{#each metas}}
             *    <meta name="{{this.name}}" content="{{this.values}}">
             *    {{/each}}
             */
            "metas":[],
            /**
             *    {{#each metas}}
             *    <meta name="{{this.name}}" content="{{this.values}}">
             *    {{/each}}
             */
            "stylesheets":["css/style.css"],
            /**
             *
             */
            "htmlFiles":[]
        };
    }

    function locate(localDir, publicDir, file, cb) {
        var localFile = path.join(localDir, file),
            publicFile = path.join(publicDir, file);

        return path.exists(localFile, function (exists) {
            return cb(exists ? localFile : publicFile);
        });
    }

    function assemble(module, res, source) {

        var template = hbars.compile(source),
            result = template(module);

        res.writeHead(HTTP_SUCCESS, {'Content-Type':'text/html'});
        res.end(result);
    }

    function indexMaker(module, req, res, next) {
        if (req.url !== '/') {
            return next();
        }

        /*
         * Load the index file. Sites can specify their own index. The index
         * can either be the name of the file to load or a function that actually
         * load the file and returns the file. Functions have to return the data
         * using a callback function that works like the callback function of
         * fs.readFile.
         */
        var index = module.index,
            indexLoader = (typeof index === "function") ? index : function (cb) {
                return fs.readFile(index, "utf8", cb);
            };

        return indexLoader(function (err, data) {
            if (err) {
                res.writeHead(HTTP_INTERNAL_ERROR, {'Content-Type':'text/html'});
                res.end('<h1>Internal Error</h1>');
            }

            return assemble(module, res, data);
        });
    }

    function getIndexMaker(module) {
        return function (req, res, next) {
            return indexMaker(module, req, res, next);
        };
    }

    function Site(mod) {
        this.module = mod;
    }

    Site.prototype.start = function (app, cb) {
        if (!this.module.hostname) {
            return cb(new Error("no hostname defined for module " + this.module));
        }

        var self = this,
            appOpts = _.clone(this.module.staticOptions),
            site = connect.createServer(),
            vhost = connect.vhost(this.module.hostname, site);

        app.use(vhost);

        /*
         * Fav icon
         */
        locate(this.module.public, PUBLIC_DIR, "favicon.ico", function (icon) {
            debug(self.module.hostname, "using", icon);
            site.use(connect.favicon(icon));

            /*
             * Load static files from the module
             */
            if (self.module.public) {
                var siteOpts = _.clone(self.module.staticOptions),
                    siteSvr = connect.static(self.module.public, siteOpts);

                site.use(siteSvr);
            }

            /*
             * Load static files from the site-manager
             */
            var appSvr = connect.static(PUBLIC_DIR, appOpts);

            site.use(appSvr);
            site.use(getIndexMaker(self.module));
        });
    };

    function startSite(site, cb) {
        var defaults = getSiteDefaults();

        if (typeof site === "function") {
            return site(defaults, cb);
        }

        for (var prop in defaults) {

            if (!(prop in site)) {
                site[prop] = defaults[prop];
            }
        }

        return cb(undefined, site);
    }

    function compileSite(conf, cb) {

        var files = conf["html-files"];

        //loading html files. Need to optimize this code.
        var htmlFiles = conf.htmlFiles;
        var rawHtml = [];

        htmlFiles.forEach(function (file) {
            var i = 0;
            fs.readFile(file, function (err, data) {
                if (err) throw err;

                if (data) {
                    rawHtml.push(data);
                }
            });
        });

        conf.rawHtml = rawHtml;

        return cb(undefined, conf);
    }

    module.exports = function (app, mod, cb) {
        debug("starting", mod);

        startSite(mod, function (err, conf) {
            if (err) {
                return cb(err);
            }

            debug("starting site", conf);

            compileSite(conf, function (err, normalized) {
                if (err) {
                    return cb(err);
                }

                var site = new Site(normalized);

                return site.start(app, cb);
            });
        });
    };
})(module, __dirname);
