/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        templates = path.join(__dirname, "templates"),
        pubdir = path.join(__dirname, "public");

    module.exports = {
        "hostname": "simple.jolira.com",
        "public": pubdir,
        "googleAnalyticsWebPropertyID": "UA-3602945-1",
        "title": "Simple Site-Manager Example",
        "metas": [
            {
                "name": "description",
                "content": "A simple demo for how to use the site-manager " +
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
                "content": "img/icon.png"
            },
            {
                "name": "apple-touch-startup-image",
                "content": "img/home.png"
            }
        ],
        "htmlFiles": [
            path.join(templates, "header.html"),
            path.join(templates, "content.html"),
            path.join(templates, "footer.html")
        ]
    };
})(module);
