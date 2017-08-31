var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var MQTTClientStub = module.exports = function(serverUrl, opts) {
  var t = this;
  t.serverUrl = serverUrl;
  t.opts = opts;
  t.publishedMsgs = [];
}
require('util').inherits(MQTTClientStub, EventEmitter);
var proto = MQTTClientStub.prototype;

MQTTClientStub.connect = function(serverUrl, opts) {
  var client = new MQTTClientStub(serverUrl, opts);
  setTimeout(function(){
    client.emit('connect');
  },1);
  return client;
}

proto.publish = function(topic, msg, opts) {
  var t = this;
  t.publishedMsgs.push({topic:topic, msg:msg, opts:opts});
}

proto.end = function() {
  var t = this;
  t.emit('close');
}

proto.getPublishedMsg = function(topic) {
  var t = this;
  return _.filter(t.publishedMsgs, {topic: topic});
}
