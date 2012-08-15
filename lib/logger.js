/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var jlogger = require('jolira-logger'),
        debug = process.env.NODE_DEBUG && /site-manager/.test(process.env.NODE_DEBUG),
        util = require('util'),
        logger = jlogger({}),
        proxy;

    proxy = function () {
        logger.info.apply(this, arguments);
    };

    proxy.init = function(config) {
        if (config["aws-logging"]) {
            logger.warning("switching to aws-logging");
            logger = jlogger(config);
        }
    };
    proxy.isDebugging = debug;
    proxy.info = function () {
        logger.info.apply(this, arguments);
    };
    proxy.debug = function () {
        if (debug) {
            logger.debug.apply(this, arguments);
        }
    };
    proxy.notice = function () {
        logger.notice.apply(this, arguments);
    };
    proxy.warn = proxy.warning = function () {
        logger.warning.apply(this, arguments);
    };
    proxy.warning = proxy.warning = function () {
        logger.warning.apply(this, arguments);
    };
    proxy.error = function () {
        logger.error.apply(this, arguments);
    };
    proxy.crit = function () {
        logger.crit.apply(this, arguments);
    };
    proxy.alert = function () {
        logger.alert.apply(this, arguments);
    };
    proxy.emerg = function () {
        logger.emerg.apply(this, arguments);
    };

    return module.exports = proxy;
})(module);