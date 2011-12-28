/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
describe('Repo', function () {
  var path = require('path');
  var repo = require('../lib/repo');
  var fs = require('fs');

  delete process.env.JOLIRA_HOME;
  repo.DEFAULT_NAME = ".smtest";

  var testPath = path.join(process.env.HOME, repo.DEFAULT_NAME);

  function rmrf(dir, callback) {
    fs.stat(dir, function(err, stats) {
      if (err) {
        return callback(err);
      }

      if (!stats.isDirectory()) {
        return fs.unlink(dir, callback);
      }

      var count = 0;
      fs.readdir(dir, function(err, files) {
        if (err) {
          return callback(err);
        }

        if (files.length < 1) {
          return fs.rmdir(dir, callback);
        }

        files.forEach(function(file) {
          var sub = path.join(dir, file);

          rmrf(sub, function(err) {
            if (err) {
              return callback(err);
            }

            if (++count == files.length) {
              fs.rmdir(dir, callback);
            }
          });
        });
      });
    });
  }

  after(function(done) {
    rmrf(testPath, done);
  });

  before(function(done) {
    rmrf(testPath, done);
  });

  describe('#load()', function () {
    it('should load without error', function (done) {
      repo.load(function (err) {
        done(err);
      });
    });
  });
});