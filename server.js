(function () {
    "use strict";

    function getInt(val) {
        if (!val) {
            return 0;
        }

        return val === +val ? val : parseInt(val, 10);
    }

    var os = require('os'),
        conf = require("./lib/parse-cli"),
        logger = require("./lib/logger"),
        cluster = require('cluster'),
        theLauncher = require('./lib/launcher'),
        watch = require("directory-tree-watcher"),
        path = require("path"),
        SITES = conf.sites || path.join(".", "sites"),
        RESTART_DELAY = conf["restart-delay"] || 1500,
        PORT = conf.port || getInt(process.env.PORT)  || getInt(process.env.C9_PORT) || 3e3,
        WORKERS = conf.cluster === true ? os.cpus().length * 2 : getInt(conf.cluster),
        SSL_PORT = conf['secure-port'],
        SSL_CERT = conf['secure-cert'],
        SSL_KEY = conf['secure-key'],
        watchAll,
        launcher;

    function fork(running) {
        var child = cluster.fork();

        running[child.pid] = true;

        return child.pid;
    }

    function shutdown(running) {
        if (!running) {
            return;
        }

        logger("Shutting down...");
        var ids = Object.keys(running);

        ids.forEach(function (id) {
            process.kill(id);
        });
    }

    function startMaster() {
        var signals = process.platform === 'win32' ?
                ['CTRL_C_EVENT', 'CTRL_BREAK_EVENT', 'CTRL_CLOSE_EVENT', 'CTRL_SHUTDOWN_EVENT'] :
                ['SIGINT', 'SIGTERM'],
            running = {};

        process.on('exit', function () {
            running = shutdown(running);
        });
        signals.forEach(function (signal) {
            process.on(signal, function () {
                running = shutdown(running);
                process.exit();
            });
        });

        // Fork workers.
        for (var i = 0; i < WORKERS; i++) {
            fork(running);
        }

        cluster.on('death', function (worker) {
            if (!worker || !running) {
                return;
            }

            delete running[worker.pid];

            var id = fork(running);

            logger('worker %s died; restarted as %s.', worker.pid, id);
        });
    }

    if (WORKERS > 1 && cluster.isMaster) {
        return startMaster();
    }

    logger.info("starting %s", process.pid);

    process.on("uncaughtException", function (exception) {
        logger.error("uncaught exception", exception,  exception && exception.stack);
        restart();
    });

    function handleError(msg, err) {
        if (err) {
            logger.alert(msg, err, err && err.stack);
            process.exit(-1);
        }
    }

    launcher = theLauncher(SITES, logger);

    function start(){
        launcher.start(PORT, SSL_PORT, SSL_KEY, SSL_CERT, function (err) {
            logger("Started...");
            handleError("starting", err);
            watchAll();
        });
    }

    function restart() {
        logger("restarting...");
        launcher.stop(function (err) {
            handleError("stopping", err);

            if (cluster.isWorker) {
                process.exit();
            }

            start();
        });
    }

    watchAll = function() {
        var watcher;

        if (conf["watch-dirs"]) {
            watch(SITES, {
                except: [".git", ".idea"]
            }, function(){
                if (watcher) {
                    watcher.close();
                }

                setTimeout(restart, RESTART_DELAY);
            }, function(err, theWatcher) {
                watcher = theWatcher;
            });
        }
    };
    start();
})();
