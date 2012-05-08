(function (process) {
    "use strict";

    var PORT = 3e3,
        RESTART_DELAY = 1500,
        logger = require("./debug"),
        theLauncher = require('./launcher'),
        watch = require("directory-tree-watcher"),
        path = require("path"),
        watchAll,
        launcher,
        sitesDir,
        port;

    logger.info("starting %s", process.pid);

    process.on("uncaughtException", function (exception) {
        logger.error("uncaught exception", exception ? exception.stack || exception : null);
        if (!logger.debug) {
            process.exit();
        }
        else {
            restart();
        }
    });

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

    function handleError(err) {
        if (err) {
            logger.alert(err.stack || err);
            process.exit(-1);
        }
    }

    sitesDir = getSitesDirectory();
    port = getPort();
    launcher = theLauncher(sitesDir);

    function start(){
        launcher.start(port, function (err) {
            logger("Started...");
            handleError(err);
            watchAll();
        });
    }

    function restart() {
        logger("Restarting...");
        launcher.stop(function (err) {
            handleError(err);

            if (logger.debug) {
                start();
            }
            else {
                process.exit();
            }
        });
    }

    watchAll = function() {
        var watcher;

        watch(sitesDir, {
            except: [".git", ".idea"]
        }, function(){
            if (watcher) {
                watcher.close();
            }

            setTimeout(restart, RESTART_DELAY);
        }, function(err, theWatcher) {
            watcher = theWatcher;
        });
    };
    start();
})(process);
