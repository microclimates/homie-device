var _ = require('lodash');
var HomieProperty = module.exports = function(homieNode, name) {
  var t = this;
  t.name = name;
  t.setter = null;
  t.isSubscribedToSet = false;
  t.rangeStart = null;
  t.rangeEnd = null;
  t.retained = false;
  t.rangeIndex = null;
  t.homieNode = homieNode;
  t.mqttTopic = t.homieNode.mqttTopic + '/' + t.name;
}
var proto = HomieProperty.prototype;

proto.setRange = function(start, end) {
  var t = this;

  // Simulating overloaded methods in C++:
  // setRange(rangeObject) and setRange(start, end)
  if (_.isObject(start)) {
    var range = start;
    t.rangeIndex = range.index;
  }
  else {
    t.rangeStart = start;
    t.rangeEnd = end;
  }
  return t;
}

proto.settable = function(setter) {
  var t = this;
  t.setter = setter;
  return t;
}

proto.setRetained = function(val) {
  var t = this;
  t.retained = val;
  return t;
}

proto.send = function(val) {
  var t = this;
  var mqttClient = t.homieNode.homieDevice.mqttClient;
  var topic = t.mqttTopic;
  if (t.rangeIndex !== null) {
    topic += '_' + t.rangeIndex;
  }
  mqttClient.publish(topic, val, {retain: t.retained});
  t.retained = false;
  t.rangeIndex = null;
  return t;
}
