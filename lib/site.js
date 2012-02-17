(function (module) {
  "use strict";

  function Site(conf) {
    this.conf = conf;
  }

  module.exports = function (conf) {
    return new Site(conf);
  };

})(module);
