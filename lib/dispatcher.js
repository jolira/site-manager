(function () {
    "use strict";

    var debug = require('./debug');

    module.exports = function (config) {
        return function (req, res, next) {
            var params = req.url.spit('/'),
                opname = params[0],
                op = config[opname];

            if (!op) {
                return next();
            }

            params.unshift(function(err, result){
                var status;
                var msg;

                if (err) {
                    status = 500;
                    msg = JSON.stringify({
                        "error": err.toString()
                    });
                }
                else if (result) {
                    status = 200;
                    msg = JSON.stringify(result);
                }

                if (status) {
                    debug("returning", status, msg);

                    res.writeHead(status, {
                        'Content-Length': msg.length,
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
                        'Pragma': 'no-cache'
                    });

                    return res.end(msg);
                }
            });
            params.unshift(req.method);

            op.apply({
                request: req,
                response: res
            }, params);
        };
    };
})();
