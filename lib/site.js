/*jslint node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var debug = require("./debug"),
        hbars = require("handlebars"),
        connect = require("connect"),
        path = require("path"),
        fs = require("fs");

    function locate(localDir, publicDir, file, cb) {
        var localFile = path.join(localDir, file),
            publicFile = path.join(publicDir, file);

        return path.exists(localFile, function (exists) {
            return cb(exists ? localFile : publicFile);
        });
    }

    function assemble(module, res, source) {
        var template = hbars.compile(source),
            result = template();

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(result);
    }

    function indexMaker(module, templates, req, res, next) {
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
        var index = module.index || path.join(templates, "index.html"),
            indexLoader = (typeof index === "function") ? index : function (cb) {
                return fs.readFile(index, "utf8", cb);
            };

        return indexLoader(function (err, data) {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end('<h1>Internal Error</h1>');
            }

            return assemble(module, res, data);
        });
    }

    function getIndexMaker(module, templates) {
        return function (req, res, next) {
            return indexMaker(module, templates, req, res, next);
        };
    }

    function Site(mod) {
        this.module = mod;
    }

    Site.prototype.start = function (app, cb) {
        var hostname = this.module.hostname;

        if (!hostname) {
            return cb(new Error("no hostname defined for module " + this.module));
        }

        var site = connect.createServer(),
            vhost = connect.vhost(hostname, site);

        app.use(vhost);

        var staticOpts = this.module.staticOptions || { /* maxAge: oneDay */ };

        /*
         * Load static files from the module
         */
        if (this.module.public) {
            site.use(connect.static(this.module.public, staticOpts));
        }

        /*
         * Global pub dir
         */
        var smhome = path.join(__dirname, ".."),
            templates = path.join(smhome, "templates"),
            pub = path.join(smhome, "public");

        /*
         * Fav icon
         */
        locate(this.module.public, pub, "favicon.ico", function (icon) {
            debug(hostname, "using", icon);
            app.use(connect.favicon(icon));
        });

        /*
         * Load static files from the site-manager
         */
        site.use(connect.static(pub, staticOpts));
        site.use(getIndexMaker(this.module, templates));
    };

    module.exports = function (app, mod, cb) {
        debug("starting", mod);
        var site = new Site(mod);

        return site.start(app, cb);
    };
})(module, __dirname);
