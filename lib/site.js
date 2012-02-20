(function (module, __dirname) {
  "use strict";

  var debug = require("./debug");
  var hbars = require("handlebars");
  var connect = require("connect");
  var path = require("path");
  var fs = require("fs");

  function locate(localDir, publicDir, file, cb) {
    var localFile = path.join(localDir, file);
    var publicFile = path.join(publicDir, file);

    return path.exists(localFile, function(exists) {
      return cb(exists ? localFile : publicFile);
    });
  }

  function assemble(module, res, source) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(source);
  }

  function indexMaker(module, templates, req, res, next) {
    if (req.url !== '/') {
      return next();
    }

    var index = module.index || path.join(templates, "index.html");
    var indexLoader = (typeof index === "function") ? index : function(cb) {
      return fs.readFile(index, "utf8", cb);
    };

    return indexLoader(function(err, data) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/html'});
        res.end('<h1>Internal Error</h1>');
      }

      return assemble(module, res, data);
    });
  }

  function getIndexMaker(module, templates) {
    return function(req, res, next) {
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

    var site = connect.createServer();
    var vhost = connect.vhost(hostname, site);

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
    var smhome = path.join(__dirname, "..");
    var templates = path.join(smhome, "templates");
    var pub = path.join(smhome, "public");

    /*
     * Fav icon
     */
    locate(this.module.public, pub, "favicon.ico", function(icon){
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
