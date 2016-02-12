'use strict'

const MsgQueue = require('./classes/msgqueue');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var msgQueue = new MsgQueue({reqTimeout: 120*1000});

app.post('/send', function (req, res) {
  let queue = req.body.queue;
  let payload = req.body.payload;

  msgQueue.send(queue, payload);

  res.send({});
});

app.post('/poll', function (req, res) {
  let queue = req.body.queue;

  let count = msgQueue.poll(queue);

  res.send({
    count: count
  });
});

app.post('/req', function (req, res) {
  let queue = req.body.queue;
  let count = req.body.count;

  let msgs = msgQueue.req(queue, count);

  res.send({
    msgs: msgs
  });
});

app.post('/ack', function (req, res) {
  let id = req.body.id;

  msgQueue.ack(id);

  res.send({});
});

app.post('/rej', function (req, res) {
  let id = req.body.id;

  msgQueue.rej(id);

  res.send({});
});

app.listen(3000, function () {
  console.log('listening on port 3000!');
});