(function () {
    "use strict";

    var HTTP_ERROR = 500,
        HTTP_SUCCESS = 200;

    // Is a given value a function?
    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    function execute(req, op, res, params) {
        var content = "";

        req.setEncoding("utf8");
        req.on("data", function (data) {
            content += data;
        });
        req.on("end", function (data) {
            if (content.length) {
                req.body = JSON.parse(content);
            }
            op.apply({
                request:req,
                response:res
            }, params);
        });
    }

    module.exports = function (config, debug) {
        return function (req, res, next) {
            var params = req.url.split('/');

            params.splice(0, 1);

            var opname = params[0],
                op = config[opname];

            if (!op) {
                return next();
            }

            params.unshift(function(err, result){
                var status;
                var msg;

                if (err) {
                    status = HTTP_ERROR;
                    msg = JSON.stringify({
                        "error": err.toString()
                    });
                }
                else if (result) {
                    status = HTTP_SUCCESS;
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

            var innerOp = op[req.method];

            if (innerOp) {
                return execute(req, innerOp, res, params);
            }

            if (!isFunction(op)) {
                return next();
            }

            params.unshift(req.method);

            return execute(req, op, res, params);
        };
    };
})();
