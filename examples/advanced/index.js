/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        templates = path.join(__dirname, "templates"),
        pubdir = path.join(__dirname, "public");

    module.exports = function (defaults, cb, properties) {
        defaults.hostname = "advanced.jolira.com";
        defaults["public"] = pubdir;
        defaults.stylesheets = [
            "css/sticky.css",
            "css/twitterbootstrap/variables.less",
            "css/twitterbootstrap/mixins.less",
            "css/twitterbootstrap/navbar.less"
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
})
(module);