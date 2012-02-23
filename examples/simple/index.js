/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path");

    module.exports = {
        "hostname": "simple.jolira.com",
        "public": path.join(__dirname, "public"),
        "googleAnalyticsWebPropertyID": "UA-3602945-1",
        "title": "Simple Site-Manager Example",
        "description": "A simple demo for how to use the site-manager (http://github.com/jolira/site-manager)"
    };
})(module);
