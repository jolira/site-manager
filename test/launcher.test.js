/*jslint white: true, forin: false, node: true, indent: 4 */
(function () {
    "use strict";

    var NO_SITE_DIR = "./no_sites",
        LISTEN_PORT = 30000,
        vows = require('vows'),
        horaa = require('horaa'),
        fs = horaa('fs'),
        assert = require('assert'),
        launcher = require('../lib/launcher'),
        connect = horaa("connect");

    fs.hijack('readFile', function (file, encoding, cb) {
        assert.equal(encoding, "utf8");
        assert.ok(/package\.json$/.test(file), file + " does not end with package.json");
    });
    fs.hijack('readdir', function (dir, cb) {
        if (dir === NO_SITE_DIR) {
            return cb(undefined, []);
        }
    });
    connect.hijack('createServer', function () {
        // nothing
    });
    connect.hijack('logger', function () {
        // nothing
    });
    connect.hijack('favicon', function () {
        // nothing
    });

// Create a Test Suite
    vows.describe('start a simple server').addBatch({
        'start': {
            topic: function () {
                var self = this,
                    svr = launcher(NO_SITE_DIR);

                svr.start(LISTEN_PORT, "1", "1", function(err) {
                    if (err) {
                        return self.callback();
                    }

                    self.callback("no sites");
                });
            },
            'successful start': function () {
                // done
            }
        }
    }).run(); // Run it
})();
