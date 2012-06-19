(function () {
    "use strict";

    var fs = require('fs'),
        util = require('./util'),
        hbars = require("handlebars"),
        crypto = require('crypto');

    function md5(str){
        return crypto
            .createHash('md5')
            .update(str)
            .digest('hex');
    }

    module.exports = function (mod, options, logger) {
        var props = util.clone(mod),
            now = new Date();

        return function (req, res, next) {
            if (!req.url.match(/\.(appcache)$/)) {
                return next();
            }

            return util.locate(mod["public"], "manifest.appcache", function (err, manifestFile) {
                if (err) {
                    return cb(err);
                }

                return fs.readFile(manifestFile, "utf-8", function (err, content) {
                    if (err) {
                        throw err;
                    }

                    var template = hbars.compile(content);

                    props.date = now;

                    var body = template(props),
                        ccontrol = logger.isDebugging ? 'NO-CACHE' : 'public, max-age=' + (options.maxAge / 1000),
                        manifest = {
                        headers: {
                            'Content-Type': 'text/cache-manifest',
                            'Content-Length': body.length,
                            'ETag': '"' + md5(body) + '"',
                            'Cache-Control': ccontrol
                        },
                        body: body
                    };

                    logger("manifest", manifest);
                    res.writeHead(200, manifest.headers);
                    return res.end(manifest.body);
                });
            });
        };
    };
})();
