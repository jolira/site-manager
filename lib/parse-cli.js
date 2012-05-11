/*jslint white: false, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var regex = /--([\w\d\-_]+)(?:=(.+))?/,
        args = process.argv.splice(2),
        param = 0,
        conf = {};

    function usage() {
        console.error("usage: %s %s [options]", process.argv[0], process.argv[1]);
        console.error("  site-manager options are:");
        console.error("   --help                    print this message");
        console.error("   --sites=<directory>       look for sites in this directory; defaults to ./sites");
        console.error("   --port=<portnumber>       set the listen port; defaults to 3000");
        console.error("   --cluster[=<workers>]     enable clustering with <workers>");
        console.error("   --debug[=true|false]      enable/disable debugging");
        console.error("   --restart-delay=<ms>      restart delay in ms; default to 1.5 seconds");
        console.error("   --watch-dirs[=true|false] auto-restart if content changes");
        console.error("  There may be other, site-specific options");
    }

    function abord() {
        console.error.apply(null, arguments);
        usage();
        process.exit(-1);
    }

    function convert(value) {
        if (!value) {
            return true;
        }

        var val = value.toLowerCase();

        if (val === 'true' || val === 'yes') {
            return true;
        }

        if (val === 'false' || val === 'false') {
            return false;
        }

        if (value.match(/\d+/)) {
            return parseInt(value);
        }

        return value;
    }

    args.forEach(function (arg) {
        if (arg[0] !== '-') {
            switch (param++) {
            case 0:
                conf.sites = arg;
                return;
            case 1:
                conf.port = arg;
                return;
            default:
                console.error("Invalid argument ", arg);
                usage();
                process.exit(-1);
            }
        }


        var matched = arg.match(regex);

        if (!matched) {
            console.error("Invalid option ", arg);
            usage();
            process.exit(-1);
        }

        var key = matched[1],
            value = matched[2];

        conf[key] = convert(value);

        if (key === 'help') {
            usage();
            process.exit(-1);
        }

        if (key === 'debug') {
            conf.cluster = false;
            conf["watch-dirs"] = true;
            if (!process.env.NODE_DEBUG) {
                process.env.NODE_DEBUG = "";
            }
            process.env.NODE_DEBUG = process.env.NODE_DEBUG + " site-manager directory-tree-watcher";
        }
    });

    module.exports = conf;
})(module);
