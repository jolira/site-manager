/*jslint white: true, forin: false, node: true, indent: 4 */
(function () {
    "use strict";

    var startSite = require('../lib/site'),
        connect = require("connect"),
        assert = require('assert'),
        vows = require('vows');

    function getSite() {
        return {
            "index": "/github/site-manager/templates/index.html",
            "staticOptions": {},
            "metas": [],
            "stylesheets": ["css/style.css"],
            "htmlFiles": [],
            "hostname": "test.jolira.com"
        };
    }

    function getSiteBadIndex() {
        return {
            "index": "/d.index.bad",
            "staticOptions": {},
            "metas": [],
            "stylesheets": ["css/style.css"],
            "htmlFiles": [],
            "hostname": "test.jolira.com"
        };
    }
    var app = {};

    // Create a Test Suite
    vows.describe('debug').addBatch({
        'Start without a site defined': {
            topic: function () {
                startSite(app, undefined, function (err) {
                    if (err) {
                        this.callback();
                    }
                    this.callback("should produce an error");
                });
            },
            'should not succeed': {
                // tested abolve
            }
        },
        'Start site with bad index': {
            topic: function () {
                var site = getSiteBadIndex();

                startSite(app, site, function (err) {
                    if (err) {
                        this.callback();
                    }
                    this.callback("should produce an error");
                });
            },
            'should not succeed': {
                // tested abolve
            }
        },
        'Start a good site': {
            topic: function () {
                var site = getSite();

                startSite(app, site, this.callback);
            },
            'should not succeed': {
                // tested abolve
            }
        }
    }).export(module);
})();
