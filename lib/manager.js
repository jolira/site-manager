/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
function Manager (connect) {
  this.connect = connect;
};

Manager.prototype.start = function(callback) {
  callback();
};

module.exports= Manager;
