(function (module) {
  "use strict";
  
  var debug = require("./debug");
  var connect = require("connect");

  function Site(mod) {
    this.module = mod;
  }
  
  Site.prototype.start = function(app, cb) {
   var hostname = this.module.hostname;
   
   if (!hostname) {
     return cb(new Error("no hostname defined for module " + this.module));
   }
   
   var site = connect.createServer();
   app.use(connect.vhost(hostname, site));
  }

  module.exports = function (app, mod, cb) {
    debug("starting", mod);
    var site = new Site(mod);
    
    return site.start(app, cb);
  };

})(module);
