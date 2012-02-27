/*jslint node: true, vars: true, indent: 4 */
/*jslint node: true, vars: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path");
    var _ = require("underscore");

    module.exports = function (defaults, cb) {
        var opts = _.extend(defaults);

        opts.hostname = "advanced.jolira.com";
        opts.public = path.join(__dirname, "public");
        opts.googleAnalyticsWebPropertyID = "UA-3602945-1";
        opts.title = "More Advanced Site-Manager Example";
        opts.metas.push([
            {
                "name": "description",
                "content": "A more advanced demo for how to use the site-manager " +
                    "(http://github.com/jolira/site-manager"
            }
        ]);

        return cb(undefined, opts);
    };
})(module);
