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
    path.exists(dir, function(exists) {
      if (!exists) {
        return callback();
      }

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
    });
  }

  afterEach(function(done) {
    rmrf(testPath, done);
  });

  afterEach(function(done) {
    rmrf(testPath, done);
  });

  describe('#load()', function () {
    it('should load an emtpy array', function (done) {
      repo.load(function (err, data) {
        if (err) {
            return done(err);
        }
        if (data.length !== 0) {
          throw new Error("invalid data");
        }

        done();
      });
    });
    it('should not load', function (done) {
      repo.load("x/y.json", function (err, data) {
        if (err) {
            return done(err);
        }
        if (data) {
          throw new Error("unexpected data" + data);
        }

        done();
      });
    });
  });

  describe('#save()', function () {
    it('should save and load without error', function (done) {
      repo.save("x.json", "{}", function (err) {
        done(err);
      });
    });
  });
});