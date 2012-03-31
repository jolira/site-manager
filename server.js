(function () {
    "use strict";

    process.on("uncaughtException", function (err) {
        console.error(err.stack || err);
    });

    var PORT = 3e3,
        RESTART_DELAY = 2500,
        debug = require("./lib/debug"),
        theLauncher = require('./lib/launcher'),
        path = require("path"),
        watch = require("directory-tree-watcher"),
        watchAll,
        launcher,
        sitesDir,
        port,
        iscID,
        iscKey;

    function getSitesDirectory() {
        if (2 < process.argv.length) {
            return process.argv[2];
        }

        if (process.env.SITE_MANAGER_DIR) {
            return process.env.SITE_MANAGER_DIR;
        }

        var cwd = process.cwd();

        return path.join(cwd, "sites");
    }

    function getPort() {
        if (3 < process.argv.length) {
            return process.argv[3];
        }

        if (process.env.SITE_MANAGER_PORT) {
            return process.env.SITE_MANAGER_PORT;
        }

        return PORT;
    }

    function getISCID() {
        if (4 < process.argv.length) {
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
        if (5 < process.argv.length) {
            return process.argv[5];
        }

        if (process.env.ISC_KEY) {
            return process.env.ISC_KEY;
        }

        console.error("No ISC key specified. Please register " +
            "at http://goo.gl/NUpFW and specify one using the ISC_KEY " +
            "envrionment variable.");
    }

    function handleError(err) {
        if (err) {
            console.error(err.stack || err);
            process.exit(-1);
        }
    }

    sitesDir = getSitesDirectory();
    port = getPort();
    iscID = getISCID();
    iscKey = getISCKey();
    launcher = theLauncher(sitesDir);

    function start(){
        launcher.start(port, iscID, iscKey, function (err) {
            debug("Started...");
            handleError(err);
            watchAll();
        });
    }

    function restart() {
        debug("Restarting...");
        launcher.stop(function (err) {
            handleError(err);
            start();
        });
    }

    process.on("uncaughtException", function () {
        restart();
    });

    watchAll = function() {
        var watcher;

        watch(sitesDir, {
            except: [".git"]
        }, function(){
            if (watcher) {
                watcher.close();
            }

            setTimeout(restart, RESTART_DELAY);
        }, function(err, theWatcher) {
            watcher = theWatcher;
        });
    };

    process.on("SIGINT", function () {
        debug("Shutting down...");
        launcher.stop(function (err) {
            handleError(err);
            process.exit(0);
        });
    });
    start();
})();
