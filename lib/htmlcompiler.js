/*jshint white: false, node: true, vars: true, indent: 4 */
(function (module, __dirname) {
    "use strict";

    var HTTP_SUCCESS = 200,
        HTTP_NOT_FOUND = 404,
        path = require("path"),
        Batch = require("batch"),
        hbars = require("handlebars"),
        clone = require("./util").clone,
        locate = require("./util").locate,
        url = require("url"),
        fs = require("fs");

    function load(cache, file, cb, debug) {
        if (Object.prototype.toString.call(file) === '[object Function]') {
            return file(cb);
        }

        var cached = cache.files[file];

        if (cached) {
            return cb(undefined, cached);
        }

        debug("reading", file);

        fs.readFile(file, "utf-8", function (err, content) {
            if (err) {
                return cb(err);
            }

            cache.files[file] = content;

            return cb(undefined, content);
        });
    }

    function compileHtml(cache, conf, file, cb, statusCode, debug) {
        var cached = cache.templates[file];

        if (cached) {
            return cb(undefined, cached, statusCode);
        }

        locate(conf["public"], file, function (err, qfile) {
            if (err) {
                if (statusCode === HTTP_NOT_FOUND) {
                    return cb(err);
                }

                return compileHtml(cache, conf, "/404.html", cb, HTTP_NOT_FOUND, debug);
            }
            return load(cache, qfile, function (err, content) {
                if (err) {
                    return cb(err);
                }

                var template = hbars.compile(content);

                cache.templates[file] = template;

                return cb(undefined, template, statusCode);
            }, debug);
        });
    }

    function compileSite(cache, conf, url, cb, debug) {
        var batch = new Batch(),
            htmlFiles = conf.htmlFiles,
            rawHtml = [],
            idx = 0;

        htmlFiles.forEach(function (file) {
            var pos = idx++;

            batch.push(function (done) {
                load(cache, file, function (err, content) {
                    if (err) {
                        return done(err);
                    }

                    rawHtml[pos] = content;
                    return done();
                }, debug);
            });
        });

        conf.htmlFiles = rawHtml;

        var templateFiles = conf.templateFiles,
            templateHtml = [];

        templateFiles.forEach(function (file) {
            var name = path.basename(file, '.html');

            batch.push(function (done) {
                load(cache, file, function (err, content) {
                    if (err) {
                        return done(err);
                    }

                    templateHtml.push({
                        name:name,
                        content:content
                    });
                    return done();
                }, debug);
            });
        });

        conf.templateFiles = templateHtml;

        return batch.end(function (err) {
            if (err) {
                return cb(err);
            }

            return compileHtml(cache, conf, url.pathname, cb, undefined, debug);
        });
    }

    module.exports = function (module, debug) {
        return function (req, res, next) {
            var cache = {
                    templates:{},
                    files:{}
                },
                parsed = url.parse(req.url, true, true);

            debug("url", req.url);

            if (!parsed.pathname || parsed.pathname === '/') {
                res.statusCode = 301;
                res.setHeader('Location', 'index.html');

                return res.end();
            }

            if (!parsed.pathname.match(/\.html$/)) {
                return next();
            }

            var mod = clone(module);

            return compileSite(cache, mod, parsed, function (err, compiled, statusCode) {
                if (err) {
                    return next(err);
                }

                var result = compiled(mod);

                res.writeHead(statusCode || HTTP_SUCCESS, {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'text/html; charset=UTF-8',
                    'Content-Length': result.length
                });

                return res.end(result);
            }, debug);
        };
    };
})(module, __dirname);
