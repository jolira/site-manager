/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var isDebug = process.env.NODE_DEBUG && /site-manager/.test(process.env.NODE_DEBUG);

    function getDebug() {
        if (isDebug) {
            return function () {
                var args = ['site-manager:'],
                    idx;

                for (idx in arguments) {
                    args.push(arguments[idx]);
                }
                console.error.apply(this, args);
            };
        }

        return function () {
        };
    }

    var debug = getDebug();

    debug.debug = isDebug;
    module.exports = debug;
})(module);