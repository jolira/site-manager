/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var vows = require('vows'),
        assert = require('assert'),
        horaa = require('horaa'),
        fs = horaa('fs'),
        manifest = require('../lib/manifest');

    fs.hijack('readFile', function (file, encoding, cb) {
        return cb(undefined, "content");
    });

    vows.describe('manifest').addBatch({
        'create the filter': {
            topic: manifest("/x/manifest.appcache", { maxAge: 0 }, function(){}),
            'not requesting manifest.appcache': {
                topic: function (filter) {
                    filter({}, {}, this.callback);
                },
                "" : function (err, result) {
                    if (err) {
                        assert.fail();
                    }
                }
            },
            'requesting manifest.appcache': {
                topic: function (filter) {
                    filter({
                        "url": "/manifest.appcache"
                    }, {
                    }, this.callback);
                },
                "" : function (err, result) {
                    if (err) {
                        assert.fail();
                    }
                }
            }
        }
    }).export(module);
})(module);
