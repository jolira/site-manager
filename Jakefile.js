/* globals desc:false, task: false, complete: fase, jake: false */
(function (desc, task, complete, jake) {
    "use strict";

    desc('The default task. Runs tests.');
    task('default', ['test'], function () {
    });

    desc('Run tests');
    task('test', [], function () {
        jake.exec(["./node_modules/.bin/vows --trace"], function () {
            console.log('All tests passed.');
            complete();
        }, {stdout: true});
    }, true);
})(desc, task, complete, jake);