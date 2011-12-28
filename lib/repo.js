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

function read(dir, callback) {
  fs.stat(dir, function(err, stats){
    if (err) {
      return callback(err);
    }

    if (stats.isDirectory()) {
      return fs.readdir();
    }

    fs.read();
  });
  callback(undefined, root);
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

function getDirectory(p) {
  var file = path.basename(p);
  var ext = path.extname(file);

  return ext !== "" ? path.dirname(p) : p;
}

function access(defaultName, qualifier, callback) {
  var root = getRoot(defaultName);
  var full = qualifier ? path.join(root, qualifier) : root;
  var dir = getDirectory(full);

  mkdirs(dir, function(err){
    callback(err, dir, full);
  });
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

  access(this.DEFAULT_NAME, qualifier, function(err, dir, full){
    if (err) {
      return callback(err);
    }

    fs.stat(full, function(err, stats){
      if (err) {
        return callback();
      }

      if (stats.isDirectory()) {
        return fs.readdir(full, callback);
      }

      fs.readFile(full, "utf8", callback);
    });
  });
};

/**
 * Load all the properties
 * @param callback the method that is called with the loaded properties
 */
Repo.prototype.save = function (qualifier, content, callback) {
  access(this.DEFAULT_NAME, qualifier, function(err, dir, full){
    if (err) {
      return callback(err);
    }

    fs.writeFile(full, content, "utf8", callback);
  });
};

module.exports = new Repo();
