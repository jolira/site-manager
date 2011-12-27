/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var fs = require('fs');
var path = require('path');

function readRoot(root, callback) {
  console.log("using root %s", root);
}

function findRoot(callback) {
  if (process.env.JOLIRA_HOME) {
    return readRoot(process.env.JOLIRA_HOME, callback);
  }
  if (!process.env.HOME) {
    return callback(new Error("Error variable ${HOME} not defined"));
  }

  var root = path.join(process.env.HOME, ".site-manager");

  readRoot(root, callback);
}

/**
 * Create a new repository.
 */
function Repo() {
}

/**
 * Load all the properties
 * @param callback the method that is called with the loaded properties
 */
Repo.prototype.load = function(callback) {

};

module.export = Repo;