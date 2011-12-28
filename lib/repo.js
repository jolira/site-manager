/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var fs = require('fs');
var path = require('path');

function mkdirs(dir, callback) {
  if (!path.exists(dir)) {
    return callback();
  }

  var parent = path.dirname(dir);

  mkdirs(parent, function(err){
    if (err) {
      return callback(err);
    }

    fs.mkdir(dir, function(err){
      return callback(err);
    });
  });
}

function readRoot(root, callback) {
  mkdirs(root, function(err){
    if (err) {
      return callback(err);
    }
  });
}

function loadRoot(defaultName, callback) {
  if (process.env.JOLIRA_HOME) {
    return readRoot(process.env.JOLIRA_HOME, callback);
  }
  if (!process.env.HOME) {
    return callback(new Error("Error variable ${HOME} not defined"));
  }

  var root = path.join(process.env.HOME, defaultName);

  readRoot(root, callback);
}

/**
 * Create a new repository.
 */
function Repo() {
  this.DEFAULT_NAME = ".sitemanager";
}

/**
 * Load all the properties
 * @param callback the method that is called with the loaded properties
 */
Repo.prototype.load = function (callback) {
  loadRoot(this.DEFAULT_NAME, callback);
};

module.exports = new Repo();
