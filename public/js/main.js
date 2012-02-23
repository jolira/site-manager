/*
 * This file should be overriden by a file with the same name in a site.
 */
/*jslint browser: true, vars: true, maxerr: 50, indent: 4 */
/*global require:false, console:false */

/**
 * Load jQuery using the approach documented in http://goo.gl/d9jSW
 */
var r = require.config({
    paths: {
        "jquery": "libs/jquery-1.7.1",
        "underscore": 'libs/underscore-1.3.1',
        "backbone": 'libs/backbone-0.9.1'
    }
});
r(["underscore", "backbone", "jquery"], function ($, _, backbone) {
    "use strict";

    console.log($);
    console.log(_);
    console.log(backbone);
});
