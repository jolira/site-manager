/*
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */

/**
 * Create a new manager.
 * @param connect the connect object to be used by the manager
 */

function Manager(connect) {
  this.connect = connect;
}

/**
 * Start the manager.
 * @param callback the method to be called when the server started.
 */
Manager.prototype.start = function (callback) {
  callback();
};

module.exports = Manager;