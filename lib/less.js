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

    function compile(localPath, globalPath, file, options, cb) {
        var qfile = path.join(localPath, file);

        return fs.readFile(qfile, "UTF-8", function (err, content) {
            if (err) {
                var msg = err.toString();
                return cb({
                    statusCode: 500,
                    headers: {
                        'Content-Type': 'text/plain',
                        'Content-Length': msg.length
                    },
                    body: msg
                });
            }

            var parser = new less.Parser({
                path: [ localPath, globalPath ],
                filename: file
            });

            parser.parse(content, function (e, tree) {
                var body = tree.toCSS({ compress: !debug.debug });
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
    }

    module.exports = function (localPath, globalPath, options) {
        var comiledByFile = {};

        function retrieve(localPath, globalPath, file, options, cb) {
            var compiled = comiledByFile[file];

            if (comiledByFile[file]) {
                return cb(compiled);
            }

            return compile(localPath, globalPath, file, options, function(compiled) {
                debug(file, compiled);
                comiledByFile[file] = compiled;

                cb(compiled);
            });
        }

        return function (req, res, next) {
            var file = req.url;

            if (!file.match(/\.(less)$/)) {
                return next();
            }

            retrieve(localPath, globalPath, file, options, function(compiled){
                res.writeHead(compiled.statusCode, compiled.headers);
                return res.end(compiled.body);
            });
        };
    };
})();
