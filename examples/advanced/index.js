/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        templates = path.join(__dirname, "templates"),
        pubdir = path.join(__dirname, "public"),
        twitterbootstrap = path.join(__dirname, "twitterbootstrap");

    module.exports = function (defaults, cb, localProperties, globalProperties, app) {
        var pubdirs = [pubdir, twitterbootstrap];

        defaults.useRequireJS = true; // set to false if require.js is not something you want to use
        defaults["public"].forEach(function (dir) {
            pubdirs.push(dir);
        });
        defaults["public"] = pubdirs;
        defaults.hostname = "advanced.jolira.com";
        defaults.stylesheets = [
            "css/sticky.css",
            "less/bootstrap.less",
            "less/responsive.less"
        ];
        defaults.trailingScripts = [
            "js/libs/jquery/jquery-1.7.1.js",
            "js/bootstrap-alert.js",
            "js/bootstrap-button.js",
            "js/bootstrap-carousel.js",
            "js/bootstrap-collapse.js",
            "js/bootstrap-dropdown.js",
            "js/bootstrap-modal.js",
            "js/bootstrap-scrollspy.js",
            "js/bootstrap-tab.js",
            "js/bootstrap-tooltip.js",
            "js/bootstrap-transition.js",
            "js/bootstrap-typeahead.js"
        ];
        defaults.googleAnalyticsWebPropertyID = "UA-3602945-1";
        defaults.title = "More Advanced Site-Manager Example";
        defaults.metas = [
            {
                "name": "description",
                "content": "A more advanced demo for how to use the site-manager " +
                    "(http://github.com/jolira/site-manager)"
            }
        ];
        defaults.htmlFiles = [
            path.join(templates, "layout.html")
        ];
        defaults.scripts = [
            "js/libs/modernizr-2.5.2.min.js",
            "js/libs/phonegap-1.4.1.js"
        ];

        return cb(undefined, defaults);
    };
})(module);