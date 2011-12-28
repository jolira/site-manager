/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var fs = require('fs');
var path = require('path');

/**
 * Create all necessary directories (recursively if necessary).
 * @param dir the directory to be created
 * @param callback called when completed
 */
function mkdirs(dir, callback) {
  path.exists(dir, function(exists){
    if (exists) {
      return callback();
    }

    var parent = path.dirname(dir);

    mkdirs(parent, function(err){
      if (err) {
        return callback(err);
      }

      fs.mkdir(dir, callback);
    });
  });
}

function read(root, callback) {
  mkdirs(root, function(err){
    if (err) {
      return callback(err);
    }

    callback(undefined, root);
  });
}

function getRoot(defaultName) {
  if (process.env.JOLIRA_HOME) {
    return process.env.JOLIRA_HOME;
  }

  if (!process.env.HOME) {
    return callback(new Error("Error variable ${HOME} not defined"));
  }

  return path.join(process.env.HOME, defaultName);
}

function load(defaultName, qualifier, callback) {
  var root = getRoot(defaultName);

  if (qualifier) {
    var full = path.join(root, qualifier);

    return read(full, callback);
  }

  read(root, callback);
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
Repo.prototype.load = function () {
  var qualifier = arguments.length < 2 ? undefined : arguments[0];
  var callback = arguments.length < 2 ? arguments[0] : arguments[1];

  load(this.DEFAULT_NAME, qualifier, callback);
};

module.exports = new Repo();
