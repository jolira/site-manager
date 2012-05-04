/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var debug = process.env.NODE_DEBUG && /site-manager/.test(process.env.NODE_DEBUG),
        util = require('util'),
        logger;

    function formatMessage() {
        var args = Array.prototype.slice.call(arguments),
            first = args.shift();

        args.unshift(new Date());
        args.unshift('[simpler-xmpp: %s] ' + first);

        return util.format.apply(this, args);
    }

    logger = debug ? function () {
        var message = formatMessage.apply(this, arguments);

        console.error(message);
    } : function () {
    };

    logger.debug = debug;

    return module.exports = logger;
})(module);