(function (exports, __dirname) {
    "use strict";

    process.on("uncaughtException", function (err) {
        console.error(err.stack || err);
    });

    var debug = require("./lib/debug"),
        _launcher = require('./lib/launcher'),
        path = require("path"),
        watch = require("directory-tree-watcher"),
        launcher,
        sitesDir,
        port,
        iscID,
        iscKey;

    function getSitesDirectory() {
        if (process.argv.length > 2) {
            return process.argv[2];
        }

        if (process.env.SITE_MANAGER_DIR) {
            return process.env.SITE_MANAGER_DIR;
        }

        var cwd = process.cwd();

        return path.join(cwd, "sites");
    }

    function getPort() {
        if (process.argv.length > 3) {
            return process.argv[3];
        }

        if (process.env.SITE_MANAGER_PORT) {
            return process.env.SITE_MANAGER_PORT;
        }

        return 3e3;
    }

    function getISCID() {
        if (process.argv.length > 4) {
            return process.argv[4];
        }

        if (process.env.ISC_ID) {
            return process.env.ISC_ID;
        }

        console.error("No ISC ID (DShield user id) specified. Please register " +
            "at http://goo.gl/NUpFW and specify one using the ISC_ID environment " +
            "variable.");
    }

    function getISCKey() {
        if (process.argv.length > 5) {
            return process.argv[5];
        }

        if (process.env.ISC_KEY) {
            return process.env.ISC_KEY;
        }

        console.error("No ISC key specified. Please register " +
            "at http://goo.gl/NUpFW and specify one using the ISC_KEY " +
            "envrionment variable.");
    }

    sitesDir = getSitesDirectory();
    port = getPort();
    iscID = getISCID();
    iscKey = getISCKey();
    launcher = _launcher(sitesDir);

    function restart() {
        launcher.restart(function (err) {
            handleError(err);
            debug("Restarted...");

            if (!err) {
                watchAll();
            }
        });
    }

    process.on("uncaughtException", function (err) {
        restart();
    });

    function watchAll() {
        var watcher;

        debug("Watching", sitesDir);
        watch(sitesDir, function(){
            if (watcher) {
                watcher.close();
            }

            restart();
        }, function(err, theWatcher) {
            watcher = theWatcher;
        });
    }

    function handleError(err) {
        if (err) {
            console.error(err.stack || err);
            process.exit(-1);
        }
    }

    process.on("SIGINT", function () {
        debug("Shutting down...");
        launcher.stop(function (err) {
            handleError(err);
            process.exit(0);
        });
    });
    launcher.start(port, iscID, iscKey, function (err) {
        handleError(err);
        debug("Started...");

        if (!err) {
            watchAll();
        }
    });
})(exports, __dirname);
