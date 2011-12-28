/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var repo = require('../lib/repo');
var fs = require('fs');

delete process.env.JOLIRA_HOME;
repo.DEFAULT_NAME = ".smtest";

describe('Repo', function () {
  describe('#load()', function () {
    it('should load without error', function (done) {
      repo.load(function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });
  });
});