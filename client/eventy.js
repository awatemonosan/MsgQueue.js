'use strict'

const Eventy = class {
  constructor(){
    this.callbacks = {};
    this.callbackRefs = [];
  }

  trigger(event, msg){
    var callbacks = this.callbacks.all || [];
    callbacks = callbacks.concat(this.callbacks[event]);

    callbacks.forEach(function(callback){
      callback.call(this, msg);
    });
  }

  on(event, callback){
    this.callbacks[event] = this.callbacks[event] || [];

    var callbackRefID = this.callbackRefs.length;
    var bucketID = this.callbacks[event].length;

    this.callbacks[event].push(callback);
    this.callbackRefs.push({event: event, id: bucketID});
  }

  once(event, callback){
    var that = this;
    return (function(){
      var refID = that.on(event, function(){
        that.off(refID);
        callback.apply(that, arguments);
      });
      return refID;
    })(); 
  }

  off(id_or_event){
    if(this.callbackRefs[id_or_event] !== undefined){
      var id = id_or_event;

      var bucket = this.callbackRefs[id];
      this.callbacks[bucket.event][bucket.id] = null;
    }
  }
};

module.exports = Eventy;