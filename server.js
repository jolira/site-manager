(function () {
    "use strict";

    var logger = require("./lib/debug"),
        cluster = require('cluster');

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

        return;
    }

    function startMaster() {
        var signals = process.platform === 'win32' ?
                ['CTRL_C_EVENT', 'CTRL_BREAK_EVENT', 'CTRL_CLOSE_EVENT', 'CTRL_SHUTDOWN_EVENT'] :
                ['SIGINT', 'SIGTERM'],
            os = require('os'),
            numCPUs = os.cpus().length,
            workers = numCPUs * 2,
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
        for (var i = 0; i < workers; i++) {
            var child = fork(running);
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

    if (!logger.debug && cluster.isMaster) {
        return startMaster();
    }

    require('./lib/server.js');
})();
