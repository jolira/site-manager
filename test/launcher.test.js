/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */

var Launcher = require('../lib/launcher');

describe('Launcher', function () {
  describe('#start()', function () {
    it('should launch without error', function (done) {
      var connect = {
        logger: function() {},
        createServer: function() {
          return { listen : function() {}};
        }
      };
      var repo = {
        load: function(callback) {
            callback(undefined, [ "x" ]);
        }
      };
      var manager = new Launcher(connect, repo);

      manager.start(function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });
});
