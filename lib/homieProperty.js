var HomieProperty = module.exports = function(homieNode, name, setter) {

  var t = this;
  t.name = name;
  t.setter = setter;
  t.rangeStart = null;
  t.rangeEnd = null;
  t.homieNode = homieNode;
  t.mqttTopic = t.homieNode.mqttTopic + '/' + t.name;

}

var proto = HomieProperty.prototype;

proto.setRange = function(start, end) {
  var t = this;
  t.rangeStart = start;
  t.rangeEnd = end;
}

proto.settable = function(setter) {
  var t = this;
  t.setter = setter;
}
