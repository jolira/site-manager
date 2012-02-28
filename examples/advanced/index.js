/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        templates = path.join(__dirname, "templates"),
        pubdir = path.join(__dirname, "public");

    module.exports = {
        "hostname": "advanced.jolira.com",
        "public": pubdir,
        "stylesheets": ["css/style.css", "css/sticky.css"],
        "googleAnalyticsWebPropertyID": "UA-3602945-1",
        "title": "More Advanced Site-Manager Example",
        "metas": [
            {
                "name": "description",
                "content": "A more advanced demo for how to use the site-manager " +
                    "(http://github.com/jolira/site-manager)"
            }
        ],
        "htmlFiles": [
            path.join(templates, "layout.html")
        ]
    };
})(module);