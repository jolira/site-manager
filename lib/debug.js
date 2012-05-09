/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var winston = require('winston'),
        debug = process.env.NODE_DEBUG && /site-manager/.test(process.env.NODE_DEBUG),
        util = require('util'),
        logger;

    function formatMessage() {
        var args = Array.prototype.slice.call(arguments),
            first = args.shift();

        args.unshift(new Date());
        args.unshift('[site-manager: %s] ' + first);

        return util.format.apply(null, args);
    }

    logger = function () {
        winston.info(formatMessage.apply(this, arguments));
    };

    logger.debug = debug;
    logger.winston = winston;
    logger.info = function () {
        winston.info(formatMessage.apply(this, arguments));
    };
    logger.dbg = function () {
        if (debug) {
            winston.log("debug", formatMessage.apply(this, arguments));
        }
    };
    logger.notice = function () {
        winston.log("info", formatMessage.apply(this, arguments));
    };
    logger.warning = function () {
        winston.log("warning", formatMessage.apply(this, arguments));
    };
    logger.error = function () {
        winston.log("error", formatMessage.apply(this, arguments));
    };
    logger.crit = function () {
        winston.log("error", formatMessage.apply(this, arguments));
    };
    logger.alert = function () {
        winston.log("error", formatMessage.apply(this, arguments));
    };
    logger.emerg = function () {
        winston.log("error", formatMessage.apply(this, arguments));
    };

    return module.exports = logger;
})(module);