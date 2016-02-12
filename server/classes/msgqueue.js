'use strict'

var MsgQueue = class {
  constructor(options){
    this.queue = [];
    this.nextMsgID = 0;
    this.reqTimeout = options.reqTimeout || 5*1000;
  }

// add message to queue
  send(queue, payload){
    var curTime = new Date().getTime();
    var msg = JSON.parse(JSON.stringify(payload));

    msg.id = this.nextMsgID++;
    msg.queue = queue;
    msg.queue_time = curTime;
    msg.req_time = 0;
    this.queue.push(msg);
  }

  poll(queue){
    var that = this;
    var curTime = new Date().getTime();

    var count = 0;
    this.queue.forEach(function(msg){
      if(msg.queue !== queue) return;
      if(curTime < msg.req_time+that.reqTimeout) return;
      count++;
    });

    return count;
  }
  
  //todo hide this shit.
  getNext(queue){
    var curTime = new Date().getTime();
    var result = null;
    var that = this;
    this.queue.forEach(function(msg){
      // return if the msg is not part of this queue
      if(msg.queue !== queue) return;
      // return if the req has not timed out
      if(curTime < msg.req_time+that.reqTimeout) return;
      // this is the next msg
      result = msg;
    });

    return result;
  }

  req(queue, count){
    // -1 means get every message from that queue
    count = count || -1;
    
    var curTime = new Date().getTime();

    var response = [];
    while(count !== 0){
      var msg = this.getNext(queue);
      // console.log(msg);
      if(msg === null) break;

      msg.req_time = curTime;
      response.push(msg);
      if(count>0) count--;
    }

    return response;
  }

  ack(id){
    console.log('ack ' + id);
    var curTime = new Date().getTime();

    for(var index=0; index<this.queue.length; index++){
      var msg = this.queue[index];
      if(msg.id !== id) continue;
      if(msg.req_time < curTime - this.reqTimeout) continue;
      console.log('acked');

      this.queue.splice(index, 1);
      break;
    }
  }

  rej(id){
    var curTime = new Date().getTime();

    for(var index=0; index<this.queue.length; index++){
      var msg = this.queue[index];
      if(msg.id !== id) continue;
      msg.req_time = 0;
      break;
    }
  }
};

module.exports = MsgQueue;
