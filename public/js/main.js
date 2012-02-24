/*
 * This file should be overriden by a file with the same name in a site.
 */
/*jslint browser: true, vars: true, maxerr: 50, indent: 4 */
/*global require:false, console:false */

// Require.js allows us to configure shortcut alias
require.config({
    paths: {
        // Major libraries
        jquery: 'libs/jquery/jquery-1.7.1',
        underscore: 'libs/underscore/underscore-min', // https://github.com/amdjs
        backbone:'libs/backbone/backbone-min', // https://github.com/amdjs
        //sinon: 'libs/sinon/sinon.js',

        // Require.js plugins
        text: 'libs/require-1.0.7/text',
        order: 'libs/require-1.0.7/order'//,

        // Just a short cut so we can put our html outside the js dir
        // When you have HTML/CSS designers this aids in keeping them out of the js directory
        //templates: '../templates'
    }
});

// Let's kick off the application
require(["underscore", "backbone", "jquery"], function (_, backbone, $) {
    "use strict";

    console.log(_);
    console.log(backbone);
    console.log($);
});

//require([
//    'views/app',
//    'router'
//], function(AppView, Router){
//    var appView = new AppView;
//    appView.render();
//    Router.initialize();
//});
