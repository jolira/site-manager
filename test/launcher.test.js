/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var NO_SITE_DIR = "/no_sites",
        ONE_SITE_DIR = "/one_site",
        LISTEN_PORT = 30000,
        vows = require('vows'),
        path = require('path'),
        horaa = require('horaa'),
        fs = horaa('fs'),
        assert = require('assert'),
        launcher = require('../lib/launcher'),
        connect = horaa("connect");

    function fileToArray(file) {
        if (file === '/') {
            return [];
        }

        var base = path.basename(file),
            result = base === file ? [] : base === file ? [] : fileToArray(path.dirname(file));

        result.push(base);

        return result;
    }

    fs.hijack('stat', function (file, cb) {
        assert.ok(/package\.json$/.test(file), file + " does not end with package.json");

        var dir = fileToArray(file);
        if (dir[0] === "one_site" && dir[1] === "test-file" && dir[2] === "package.json") {
            return cb(undefined, "{}");
        }

        return cb(new Error(file + " not found."));
    });
    fs.hijack('readdir', function (dir, cb) {
        if (dir === NO_SITE_DIR) {
            return cb(undefined, []);
        }

        if (dir === ONE_SITE_DIR) {
            return cb(undefined, ["test-file"]);
        }

        return cb(new Error(dir + " not found."));
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
    vows.describe('start a server').addBatch({
        'with an empty directory': {
            topic: function () {
                var self = this,
                    svr = launcher(NO_SITE_DIR);

                svr.start(LISTEN_PORT, "1", "1", function (err) {
                    if (err) {
                        return self.callback(undefined, svr);
                    }

                    self.callback(new Error("an 'no sites' error should have been reported"));
                });
            },
            'causes the start to fail': {
                "topic": function (svr) {
                    var self = this;

                    svr.stop(function (err) {
                        if (err) {
                            return self.callback(undefined, svr);
                        }

                        self.callback(new Error("server should have signaled that no site was started"));
                    });
                },
                "and stopping to fail also": function (err, result) {
                    // works great.
                }
            }
        },
        'with one site': {
            topic: function () {
                var self = this,
                    svr = launcher(ONE_SITE_DIR);

                svr.start(LISTEN_PORT, "1", "1", function (err) {
                    if (err) {
                        return self.callback(err);
                    }

                    self.callback(undefined, svr);
                });
            },
            'starts successfully': {
                "topic": function (svr) {
                    var self = this;

                    svr.stop(function (err) {
                        if (err) {
                            return self.callback(undefined, svr);
                        }

                        self.callback(new Error("server should have signaled that no site was started"));
                    });
                },
                "and stops without problem": function (err, result) {
                    // works great.
                }
            }
        }
    }).export(module);
})(module);
