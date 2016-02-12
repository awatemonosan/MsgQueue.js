'use strict'

const Eventy = require('./eventy');
const request = require('request-json');

class MsgQueueClient extends Eventy {
  constructor(url){
    super();
    this.url = url;
    this.client = request.createClient(url);
  }

  sendToServer(apiEndpoint, payload) {
    var that = this;
    return new Promise(function(resolve, reject){
      that.client.post(apiEndpoint, payload, function (err, res, body) {
        if (!err && res.statusCode == 200){
          console.log(apiEndpoint + ' successful');
          resolve(body);
        } else {
          console.log(apiEndpoint + ' failed');
          reject(body);
        }
      });
    });
  }

  send(queue, payload){
    var that = this;
    console.log('sending "' + payload.toString() + '" to "' + queue + '" queue');
    return new Promise(function(resolve, reject){
      that.sendToServer('send', {queue:queue, payload:payload})
      .then(function(){ resolve(); })
      .catch(function(){ reject(); });
    });
  }

  poll(queue){
    var that = this;
    console.log('polling for messages in "' + queue + '" queue');
    return new Promise(function(resolve, reject){
      that.sendToServer('poll', {queue:queue})
      .then(function(body){ resolve(body.count); })
      .catch(function(body){ reject(); });
    });
  }

  req(queue, count){
    var that = this;
    console.log('requesting "' +count+ '" messages from "' + queue + '" queue');
    return new Promise(function(resolve, reject){
      that.sendToServer('req', {queue:queue,count:count})
      .then(function(body){ resolve(body.msgs); })
      .catch(function(body){ reject(); });
    });
  }

  ack(id){
    var that = this;
    console.log('acking message ID "' +id+ '"');
    return new Promise(function(resolve, reject){
      that.sendToServer('ack', {id:id})
      .then(function(body){ resolve(); })
      .catch(function(body){ reject(); });
    });
  }

  rej(id){
    var that = this;
    console.log('rejecting message ID "' +id+ '"');
    return new Promise(function(resolve, reject){
      that.sendToServer('rej', {id:id})
      .then(function(body){ resolve(); })
      .catch(function(body){ reject(); });
    });
  }

  listen(queue, interval){
    interval = interval || 500;
    var that = this;
    return setInterval( function(){
      // Poll to see if there are messages
      that.poll(queue)
      .then(function(count){
        return new Promise(function(resolve, reject){
          if(count === 0){
            reject();
          } else {
            that.req(queue, count)
            .then(function(msgs){
              resolve(msgs);
            })
            .catch(function(){
              reject();
            });
          }
        });
      })
      // if there are, then trigger the event system
      .then(function(msgs){
        console.log('triggering ' +msgs.length+ ' events');
        msgs.forEach(function(msg){
          that.trigger(queue, msg);
          that.ack(msg.id);
        });
      });
    }, interval);
  }

  stop(listenerRef){
    clearInterval(listenerRef);
  }
};

module.exports = MsgQueueClient;
