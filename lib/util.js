/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var fs = require("fs"),
        path = require("path"),
        exists = fs.exists || fs.exists;

    function locate(dirs, file, cb, idx) {
        var i = idx || 0;

        if (i >= dirs.length) {
            return cb(new Error("file " + file + " not find in " + dirs));
        }

        var qfile = path.join(dirs[i], file);

        return exists(qfile, function (exists) {
            if (exists) {
                return cb(undefined, qfile);
            }

            return locate(dirs, file, cb, i + 1);
        });
    }

    function clone(obj) {
        if (!obj) {
            return obj;
        }

        if (Array.isArray(obj)) {
            var result = [];

            obj.forEach(function(item){
                result.push(clone(item));
            });

            return result;
        }

        if (obj !== Object(obj)) {
            return obj;
        }

        var keys = Object.keys(obj),
            result = {};

        keys.forEach(function(key){
            result[key] = clone(obj[key]);
        });

        return result;
    }

    module.exports = {
        locate: locate,
        clone: clone
    };
})(module, __dirname);
