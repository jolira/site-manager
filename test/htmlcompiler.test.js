/*jslint white: true, forin: false, node: true, indent: 4 */
(function (module) {
    "use strict";

    var path = require("path"),
        vows = require('vows'),
        assert = require('assert'),
        htmlcomiler = require('../lib/htmlcompiler');

    // Create a Test Suite
    vows.describe('htmlcompiler').addBatch({
        redirect: {
            topic: function () {
                return htmlcomiler({}, console.log);
            },
            process: {
                "topic": function (compiler) {
                    var self = this,
                        result = {};
                    compiler({
                        url: "/"
                    }, {
                        end: function () {
                            assert.equal(0, arguments.length);
                            self.callback(undefined, result);
                        },
                        setHeader: function (key, value) {
                            assert.equal(key, "Location");
                            assert.equal(value, "index.html");

                            result.redirect = true;
                        },
                        writeHead: function() {
                            // nothing
                        }
                    }, function (err) {
                        self.callback(err, result);
                    });
                },
                check: function (result) {
                    if (!result.redirect) {
                        return assert.fail("no redirected");
                    }
                }
            }
        },
        'test.css': {
            topic: function () {
                return htmlcomiler({}, console.log);
            },
            process: {
                "topic": function (compiler) {
                    var self = this;

                    compiler({
                        url: "/test.css"
                    }, undefined, function (err) {
                        self.callback(err, true);
                    });
                },
                check: function (result) {
                    if (result !== true) {
                        return assert.fail(result);
                    }
                }
            }
        },
        'index.html': {
            topic: function () {
                return htmlcomiler({
                    htmlFiles: [
                        path.join(__dirname, "..", "examples", "advanced", "templates", "layout.html")
                    ],
                    templateFiles: [
                        path.join(__dirname, "..", "examples", "advanced", "templates", "layout.html")
                    ],
                    public: [
                        path.join(__dirname, "..", "public")
                    ]
                }, console.log);
            },
            process: {
                "topic": function (compiler) {
                    var self = this,
                        result = {
                            compiler: compiler
                        };

                    compiler({
                        url: "/index.html"
                    }, {
                        end: function (content) {
                            result.content = content;

                            self.callback(undefined, result);
                        },
                        setHeader: function (key, value) {
                            assert.equal(key, "Content-Type");
                            assert.equal(value, "text/html; charset=UTF-8");

                            result.contenttype = true;
                        },
                        writeHead: function(status, header) {
                            result.contenttype = header["Content-Type"];
                        }
                    }, function (err) {
                        self.callback(err);
                    });
                },
                repeat: {
                    "topic": function (result) {
                        var compiler = result.compiler,
                            self = this;

                        if (!result.contenttype) {
                            return assert.fail("no Content-Type");
                        }

                        compiler({
                            url: "/index.html"
                        }, {
                            end: function (content) {
                                result.content = content;

                                self.callback(undefined, result);
                            },
                            setHeader: function (key, value) {
                                assert.equal(key, "Content-Type");
                                assert.equal(value, "text/html; charset=UTF-8");

                                result.contenttype = true;
                            },
                            writeHead: function(status, header) {
                                result.contenttype = header["Content-Type"];
                            }
                        }, function (err) {
                            self.callback(err);
                        });
                    },
                    check: function (result) {
                        if (!result.contenttype) {
                            return assert.fail("no Content-Type");
                        }
                    }
                }
            }
        }
    }).export(module);
})(module);
