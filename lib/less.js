(function () {
    "use strict";

    var fs = require('fs'),
        path = require('path'),
        debug = require('./debug'),
        crypto = require('crypto'),
        less = require('less');

    function md5(str){
        return crypto
            .createHash('md5')
            .update(str)
            .digest('hex');
    }

    function locate(dirs, file, cb, idx) {
        var i = idx || 0;

        if (i >= dirs.length) {
            return cb(new Error("file " + file + " not find in " + dirs));
        }

        var _file = path.join(dirs[i], file);

        return path.exists(_file, function (exists) {
            if (exists) {
                return cb(undefined, _file);
            }

            return locate(dirs, file, cb, i + 1);
        });
    }

    function reportException(qfile, err, cb) {
        debug("exception while compiling", qfile, err.stack || err);
        var msg = err.toString();

        return cb({
            statusCode:500,
            headers:{
                'Content-Type':'text/plain',
                'Content-Length':msg.length
            },
            body:msg
        });
    }

    function compile(dirs, file, options, cb) {
        locate(dirs, file, function(err, qfile){
            return fs.readFile(qfile, "UTF-8", function (err, content) {
                if (err) {
                    return reportException(qfile, err, cb);
                }

                var baseDir = path.dirname(qfile),
                    searchPaths = dirs.slice(0);

                searchPaths.push(baseDir);

                var parser = new less.Parser({
                    paths: searchPaths,
                    filename: file
                });

                parser.parse(content, function (e, tree) {
                    var body;

                    try {
                        body = tree.toCSS({ compress: !debug.debug });
                    }
                    catch(e) {
                        return reportException(qfile, e, cb);
                    }
                    cb({
                        headers: {
                            'Content-Type': 'text/css',
                            'Content-Length': body.length,
                            'ETag': '"' + md5(body) + '"',
                            'Cache-Control': 'public, max-age=' + (options.maxAge / 1000)
                        },
                        statusCode: 200,
                        body: body
                    });
                });
            });
        });
    }

    module.exports = function (dirs, options) {
        var comiledByFile = {};

        function retrieve(dirs, file, options, cb) {
            if (!debug.debug) {
                var compiled = comiledByFile[file];

                if (comiledByFile[file]) {
                    return cb(compiled);
                }
            }

            return compile(dirs, file, options, function(compiled) {
                debug(file, compiled);

                if (!debug.debug) {
                    comiledByFile[file] = compiled;
                }

                cb(compiled);
            });
        }

        return function (req, res, next) {
            var file = req.url;

            if (!file.match(/\.(less)$/)) {
                return next();
            }

            retrieve(dirs, file, options, function(compiled){
                res.writeHead(compiled.statusCode, compiled.headers);
                return res.end(compiled.body);
            });
        };
    };
})();
