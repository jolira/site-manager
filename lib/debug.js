/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    if (process.env.NODE_DEBUG && /site-manager/.test(process.env.NODE_DEBUG)) {
        return module.exports = function () {
            var args = ['site-manager:'];

            for (var idx in arguments) {
                args.push(arguments[idx]);
            }
            console.error.apply(this, args);
        };
    }

    return module.exports = function () {
    };
})(module);