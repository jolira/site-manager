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

    function logEvent(e) {
        var onLine = (navigator.onLine) ? 'yes' : 'no',
            message = 'online: ' + onLine + ', event: ' + e.type +
            ', status: ' + cacheStatusValues[cache.status];

        if (type == 'error' && navigator.onLine) {
            message += ' There was an unknown error, check your Cache Manifest.';
        }

        console.log(message);
    }

    cache.addEventListener('updateready', function (e) {
            // Don't perform "swap" if this is the first cache
            if (cacheStatusValues[cache.status] != 'idle') {
                cache.swapCache();

                console.log('Swapped/updated the Cache Manifest.');

                if (confirm('Updates to the program are available. Load them?')) {
                    window.location.reload();
                }
            }
        }, false);
    cache.update();
})();