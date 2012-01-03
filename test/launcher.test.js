/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */

var Launcher = require('../lib/launcher');

describe('Launcher', function () {
  describe('#start()', function () {
    it('should save without error', function (done) {
      var connect = {
        logger: function() {},
        createServer: function() {
          return { listen : function() {}};
        }
      };
      var manager = new Launcher(connect);

      manager.start(function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });
});
