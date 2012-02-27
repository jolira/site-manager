var fs = require('fs');
var path = require('path');

function forEachFile(root, cbFile, cbDone) {
    var count = 0;

    function done() {
        --count;
        if (count === 0 && cbDone) cbDone();
    }

    function scan(name) {
        ++count;

        fs.stat(name, function (err, stats) {
            if (err) cbFile(err);

            if (stats.isDirectory()) {
                fs.readdir(name, function (err, files) {
                    if (err) cbFile(err);

                    files.forEach(function (file) {
                        scan(path.join(name, file));
                    });
                    done();
                });
            } else if (stats.isFile()) {
                cbFile(null, name, stats, done);
            } else {
                done();
            }
        });
    }

    scan(root);
}

desc('The default task. Runs tests.');
task('default', ['tests'], function() {
})

desc('Run tests');
task('tests', [], function(){
    forEachFile("test", function(err, file){
        require("./" + file);
    }, complete);
}, true);