(function () {
    "use strict";

    var fs = require('fs'),
        debug = require('./debug'),
        crypto = require('crypto');

    function md5(str){
        return crypto
            .createHash('md5')
            .update(str)
            .digest('hex');
    }

    module.exports = function (path, opts) {
        var manifest,
            options = opts || {},
            thePath = path || __dirname + '/../public/favicon.ico',
            maxAge = options.maxAge || 86400000,
            now = new Date();

        return function (req, res, next) {
            if ('/manifest.appcache' !== req.url) {
                return next();
            }

            if (manifest) {
                res.writeHead(200, manifest.headers);
                return res.end(manifest.body);
            }

            fs.readFile(thePath, function (err, content) {
                if (err) {
                    return next(err);
                }
                content += "\n// " + now;
                manifest = {
                    headers:{
                        'Content-Type': 'text/cache-manifest',
                        'Content-Length': content.length,
                        'ETag': '"' + md5(content) + '"',
                        'Cache-Control': 'public, max-age=' + (maxAge / 1000)
                    },
                    body:content
                };
                debug("manifest:", manifest);
                res.writeHead(200, manifest.headers);
                res.end(manifest.body);
            });
        };
    };
})();
