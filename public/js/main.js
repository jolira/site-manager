/*
 * This file should be overriden by a file with the same name in a site.
 */
/*jslint browser: true, vars: true, maxerr: 50, indent: 4 */
/*global require:false, console:false */

/**
 * Load jQuery using the approach documented in http://goo.gl/d9jSW
 */
require.config({
    paths: {
        "jquery": "libs/jquery-1.7.1"
    }
});
require(["jquery"], function ($) {
    "use strict";

    console.log($);
});
