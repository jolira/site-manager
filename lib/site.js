(function (module, __dirname) {
  "use strict";

  var debug = require("./debug");
  var connect = require("connect");
  var path = require("path");
  var fs = require("fs");

  function locateFavIcon(localDir, publicDir, cb) {
    var localIco = path.join(localDir, "favicon.ico");
    var publicIco = path.join(publicDir, "favicon.ico");

    return fs.stat(localIco, function(err, stat) {
      if (err) {
        return cb(publicIco);
      }

      return cb(localIco);
    });
  }

  function indexMaker(module, req, res, next) {
    if (req.url !== '/') {
      return next();
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  }

  function getIndexMaker(module) {
    return function(req, res, next) {
      return indexMaker(module, req, res, next);
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
    var pub = path.join(path.join(__dirname, ".."), "public");

    /*
     * Fav icon
     */
    locateFavIcon(this.module.public, pub, function(icon){
      debug(hostname, "using", icon);
      app.use(connect.favicon(icon));
    });

    /*
     * Load static files from the site-manager
     */
    site.use(connect.static(pub, staticOpts));
    site.use(getIndexMaker(this.module));
  };

  module.exports = function (app, mod, cb) {
    debug("starting", mod);
    var site = new Site(mod);

    return site.start(app, cb);
  };
})(module, __dirname);
