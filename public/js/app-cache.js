/*global PhoneGap:false, require:false */
(function () {
    "use strict";

    var cacheStatusValues = ['uncached', 'idle', 'checking', 'downloading', 'updateready', 'obsolete'],
        cache = window.applicationCache;

    cache.addEventListener('cached', logEvent, false);
    cache.addEventListener('checking', logEvent, false);
    cache.addEventListener('downloading', logEvent, false);
    cache.addEventListener('error', logEvent, false);
    cache.addEventListener('noupdate', logEvent, false);
    cache.addEventListener('obsolete', logEvent, false);
    cache.addEventListener('progress', logEvent, false);
    cache.addEventListener('updateready', logEvent, false);

// Log every event to the console
    function logEvent(e) {
        var online, status, type, message;
        online = (isOnline()) ? 'yes' : 'no';
        status = cacheStatusValues[cache.status];
        type = e.type;
        message = 'online: ' + online;
        message += ', event: ' + type;
        message += ', status: ' + status;

        if (type == 'error' && navigator.onLine) {
            message += ' There was an unknown error, check your Cache Manifest.';
        }
        log(message);
    }

    function log(s) {
        console.log(s);
    }

    function isOnline() {
        return navigator.onLine;
    }

    if (!$('html').attr('manifest')) {
        log('No Cache Manifest listed on the  tag.')
    }

// Swap in newly download files when update is ready
    cache.addEventListener('updateready', function (e) {
            // Don't perform "swap" if this is the first cache
            if (cacheStatusValues[cache.status] != 'idle') {
                cache.swapCache();
                log('Swapped/updated the Cache Manifest.');
            }
        }, false);
    cache.update();
})();