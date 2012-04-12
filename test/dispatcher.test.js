/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var vows = require('vows'),
        assert = require('assert'),
        dispatcher = require('../lib/dispatcher');

    vows.describe('happy case').addBatch({
        'create the filter': {
            topic: dispatcher("test", function (method, cb, operation, param1, param2) {
                // TODO
            }),
            '/test/1/2': {
                topic: function (filter) {
                    filter({
                        'url': '/test/1/2'
                    }, {}, function () {
                        assert.fail("should not be called");
                    });
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
