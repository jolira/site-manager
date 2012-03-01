/*jslint white: true, forin: false, node: true, indent: 4 */
process.env.NODE_ENV = 'test';

var startSite = require('../lib/site'),
    connect = require("connect"),
    assert = require('assert'),
    testCase = require('nodeunit').testCase;

function getSite() {
    return {
        "index":"/github/site-manager/templates/index.html",
        "staticOptions":{},
        "metas":[],
        "stylesheets":["css/style.css"],
        "htmlFiles":[],
        "hostname":"test.jolira.com"
    };
}

function getSiteBadIndex() {
    return {
        "index":"/d.index.bad",
        "staticOptions":{},
        "metas":[],
        "stylesheets":["css/style.css"],
        "htmlFiles":[],
        "hostname":"test.jolira.com"
    };
}

exports.startSite = testCase({

    'Start without a sites defined':function (test) {

        var app = connect.createServer();
        var listenPort = 8080
        app.listen(listenPort);

        var sites = [];

        startSite(app, sites, function (err) {
            test.expect(1);
            test.equal(err, 'Error: no hostname defined for module ');
        });

        app.close();
        test.done()
    },

    'start site with bad index':function (test) {
        process.env.NODE_DEBUG = 'site-manager';
        var app = connect.createServer();
        var listenPort = 8080
        app.listen(listenPort);

        startSite(app, getSiteBadIndex(), function (err) {
            test.expect(1);
            test.equal(err, 'Error: ENOENT, no such file or directory \'/d.index.bad\'');
        });

        app.close();
        test.done();
    },

    'start site':function (test) {
        process.env.NODE_DEBUG = 'site-manager';
        var app = connect.createServer();
        var listenPort = 8080
        app.listen(listenPort);

        startSite(app, getSite(), function (err) {
            //Fail if we get an error
            assert(false);
        });

        app.close();
        test.done();
    }


});