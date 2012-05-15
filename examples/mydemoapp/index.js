(function (__dirname, module) {
    "use strict";
    var path = require("path");
    module.exports = function (defaults, cb, properties, app) {
        defaults.useRequireJS = false; // disable the site-manager support for requireJS
        defaults.hostname = "mydemoapp.jolira.com"; // define the name of the site
        defaults.title = "My Demo App"; // The title to be displayed in the titlebar
        defaults.htmlFiles = [
            path.join(__dirname, "content.html") // add some content
        ];
        return cb(undefined, defaults);
    };
})(__dirname, module);
