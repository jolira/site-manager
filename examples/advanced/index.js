/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        templates = path.join(__dirname, "templates"),
        pubdir = path.join(__dirname, "public"),
        twitterbootstrap = path.join(__dirname, "twitterbootstrap");

    module.exports = function (defaults, cb, localProperties, globalProperties, app) {
        var pubdirs = [pubdir, twitterbootstrap];

        defaults.useRequireJS = false; // set to false if require.js is not something you want to use
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
            "js/app-cache.js",
            "js/libs/jquery/jquery-1.7.1.js"
        ];
        defaults.googleAnalyticsWebPropertyID = "UA-3602945-1";
        defaults.title = "More Advanced Site-Manager Example";
        defaults.metas = [
            {
                "name": "description",
                "content": "A more advanced mydemoapp for how to use the site-manager " +
                    "(http://github.com/jolira/site-manager)"
            },
            {
                "name": "apple-mobile-web-app-capable",
                "content": "yes"
            },
            {
                "name": "apple-mobile-web-app-status-bar-style",
                "content": "black"
            },
            {
                "name": "apple-touch-icon",
                "content": "iapple-touch-icon-57x57-precomposed.png"
            },
            {
                "name": "apple-touch-startup-image",
                "content": "apple-touch-icon-114x114-precomposed.png"
            }
        ];
        defaults.htmlFiles = [
            path.join(templates, "layout.html")
        ];

        return cb(undefined, defaults);
    };
})(module);