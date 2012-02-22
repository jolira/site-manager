/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path");

    module.exports = {
        "hostname": "simple.jolira.com",
        "public": path.join(__dirname, "public"),
        "GoogleAnalyticsWebPropertyID": "UA-3602945-1"
    };
})(module);
