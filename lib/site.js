(function (module) {
  "use strict";

  var debug = require("./debug");
  var connect = require("connect");
  var path = require("path");

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

    if (this.module.public) {
      site.use(connect.static(this.module.public, staticOpts));
    }

    var pub = path.join(path.join(__dirname, ".."), "public");

    site.use(connect.static(pub, staticOpts));
  };

  module.exports = function (app, mod, cb) {
    debug("starting", mod);
    var site = new Site(mod);

    return site.start(app, cb);
  };
})(module);
