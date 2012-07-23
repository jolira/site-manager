/*global PhoneGap:false, require:false */
(function (window, navigator, console) {
    "use strict";

    /**
     * Defines log messages and add a generic handler for caching.
     */

    // See http://www.html5rocks.com/en/tutorials/cache/beginner
    var cache = window.applicationCache,
        app = window["jolira-app"] = window["jolira-app"] || {};

    app.debug =
        app.log = function () {
            console.log.apply(console, arguments);
        }

    app.error = function () {
        console.error.apply(console, arguments);
    }

    window.addEventListener("error", function(message, url, linenumber) {
        app.error(message, url, linenumber);
    });

    app.cache = app.cache || {};

    /**
     * Override this handler if you would like to handle the update differently
     */
    app.cache.updateReady = app.cache.updateReady || function () {
        if (confirm('Program updates are available. Load them now?')) {
            window.location.reload();
        }
    };

    function getCacheStatus() {
        switch (cache.status) {
            case cache.UNCACHED: // UNCACHED == 0
                return 'UNCACHED';
            case cache.IDLE: // IDLE == 1
                return 'IDLE';
            case cache.CHECKING: // CHECKING == 2
                return 'CHECKING';
            case cache.DOWNLOADING: // DOWNLOADING == 3
                return 'DOWNLOADING';
            case cache.UPDATEREADY:  // UPDATEREADY == 4
                return 'UPDATEREADY';
            case cache.OBSOLETE: // OBSOLETE == 5
                return 'OBSOLETE';
        }
        return 'UNKNOWN';
    }

    function logEvent(e) {
        var type = e.type,
            status = getCacheStatus(),
            onLine = (navigator.onLine) ? 'yes' : 'no',
            message = 'online: ' + onLine + ', event: ' + type + ', status: ' + status;

        if (type === 'error' && navigator.onLine) {
            message += '; There was an unknown error, check your Cache Manifest.';
        }

        app.log(message);
    }

    window.addEventListener('load', function (e) {
        cache.addEventListener('cached', logEvent, false);
        cache.addEventListener('checking', logEvent, false);
        cache.addEventListener('downloading', logEvent, false);
        cache.addEventListener('error', logEvent, false);
        cache.addEventListener('noupdate', logEvent, false);
        cache.addEventListener('obsolete', logEvent, false);
        cache.addEventListener('progress', logEvent, false);
        cache.addEventListener('updateready', function (e) {
            logEvent(e);

            if (cache.status === cache.UPDATEREADY) {
                cache.swapCache();

                app.log('Swapped/updated the Cache Manifest.');
                app.cache.updateReady();
            }
        }, false);
    }, false);
})(window, navigator, console);