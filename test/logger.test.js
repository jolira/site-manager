/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var NODE_DEBUG = process.env.NODE_DEBUG,
        vows = require('vows'),
        debug = require('../lib/logger');

    // Create a Test Suite
    vows.describe('logger').addBatch({
        'with output turned on': {
            topic: function () {
                process.env.NODE_DEBUG = "site-manager";
                debug("test1");
                this.callback();
            },
            'with output turned off': {
                "topic": function () {
                    process.env.NODE_DEBUG = "";
                    debug("test2");
                    this.callback();
                },
                "restore debug settings": function () {
                    if (NODE_DEBUG) {
                        process.env.NODE_DEBUG = NODE_DEBUG;
                    }
                }
            }
        }
    }).export(module);
})(module);
