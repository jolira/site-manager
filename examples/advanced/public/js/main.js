/*jslint browser: true, vars: true, maxerr: 50, indent: 4 */
/*global require:false, console:false */

// Require.js allows us to configure shortcut alias
require.config({
    paths: {
        // Major libraries
        jquery: 'libs/zepto-1.0RC1',
        underscore: 'libs/underscore/underscore-1.3.2-amdjs', //https://github.com/amdjs
        backbone: 'libs/backbone/backbone-0.9.2-amdjs', //https://github.com/amdjs
        // Require.js plugins
        text: 'libs/require/text-1.0.7',
        //order: 'libs/require-1.0.7/order'//,
        handlebars: 'libs/handlebars/handlebars-1.0.0b6',
        // Just a short cut so we can put our html outside the js dir
        // When you have HTML/CSS designers this aids in keeping them out of the js directory
        templates: '../templates'
    }
});

require(["jquery", "underscore"], function ($, _) {
        "use strict";
        console.log($);
        console.log(_);
    }
);

//require([
//    'view/app','router'], function(AppView, Router){
//    var appView = new AppView;
//    appView.render();
//    Router.initialize();
//});