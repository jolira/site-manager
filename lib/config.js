(function (module, __dirname) {
    "use strict";

    var debug = require('./debug'),
        fs = require('fs'),
        path = require('path');

    module.exports = function (file, cb) {
        return fs.readFile(file, "utf-8", function(err, data) {
            if (err) {
                debug("failed to load", file, err);
                return cb();
            }

            var props = JSON.parse(data);

            debug("read properties", props, file);

            return cb(undefined, props);
        });
    };
})(module);
