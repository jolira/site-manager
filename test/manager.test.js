/**
 * (C) 2012 Jolira; distributed under AGPL 3.0
 *
 */
var Manager = require('../lib/manager');

describe('Manager', function(){
  describe('#start()', function(){
    it('should save without error', function(done){
      var manager = new Manager(undefined);

      manager.start(function(err){
        if (err) throw err;
        done();
      });
    })
  })
})
