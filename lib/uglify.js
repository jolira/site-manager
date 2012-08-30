/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var HTTP_SUCCESS = 200,
        uglifyjs = require("uglify-js"),
        util = require("./util"),
        Batch = require("batch"),
        url = require("url"),
        fs = require("fs"),
        jsp = uglifyjs.parser,
        pro = uglifyjs.uglify,
        locate = util.locate;

    function match(req) {
        var parsed = url.parse(req.url, true, true);

        return parsed.pathname === "/js/trailing.js";
    }

    function load(module, script, cb) {
        return locate(module["public"], script, function (err, quaified) {
            if (err) {
                return cb(err);
            }

            return fs.readFile(quaified, "utf-8", cb);
        });
    }

    function uglify(scripts,  cb) {
        var ast = jsp.parse(scripts);

        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);

        return cb(undefined, pro.gen_code(ast));
    }

    module.exports = function (module, debug) {
        return function (req, res, next) {
            return next(); // disabled
        };

        var trailingScripts = module.trailingScripts;

        module.trailingScripts = [ "js/trailing.js" ];

        return function (req, res, next) {
            if (!match(req)) {
                return next();
            }

            var batch = new Batch();

            trailingScripts.forEach(function(script) {
                return batch.push(function(done) {
                    return load(module, script, done);
                });
            });

            return batch.end(function(err, loaded) {
                if (err) {
                    return next(err);
                }

                var scripts = "";

                loaded.forEach(function(script){
                    scripts += script;
                });

                res.writeHead(HTTP_SUCCESS, {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Content-Length': scripts.length
                });

                return res.end(scripts);
                return uglify(scripts, function(err, uglified) {
                    if (err) {
                        return next(err);
                    }

                    res.writeHead(HTTP_SUCCESS, {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Content-Length': uglified.length
                    });

                    return res.end(uglified);
                });
            });
        };
    };
})(module, __dirname);
