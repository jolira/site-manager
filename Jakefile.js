/* globals desc:false, task: false, complete: fase, jake: false */
(function (desc, task, complete, jake) {
    "use strict";

    desc('The default task. Runs tests.');
    task('default', ['tests'], function () {
    });

    desc('Run tests');
    task('tests', [], function () {
        jake.exec(["./node_modules/.bin/vows test/debug.test.js"], function () {
            console.log('All tests passed.');
            complete();
        }, {stdout: true});
    }, true);
})(desc, task, complete, jake);