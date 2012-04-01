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

    module.exports = function (path, options) {
        var manifest;

        fs.readFile(path, "UTF-8", function (err, content) {
            if (err) {
                throw err;
            }

            var body = content + "\n# " + new Date();

            manifest = {
                headers: {
                    'Content-Type': 'text/cache-manifest',
                    'Content-Length': body.length,
                    'ETag': '"' + md5(body) + '"',
                    'Cache-Control': 'public, max-age=' + (options.maxAge / 1000)
                },
                body: body
            };
            debug("manifest header:", manifest.headers);
            debug("manifest body:", manifest.body);
        });

        return function (req, res, next) {
            if (!req.url.match(/\.(appcache)$/)) {
                return next();
            }

            res.writeHead(200, manifest.headers);
            return res.end(manifest.body);
        };
    };
})();
