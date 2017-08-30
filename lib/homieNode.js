var _ = require('lodash');
var HomieProperty = require('./homieProperty');

var HomieNode = module.exports = function(homieDevice, name, type) {

  var t = this;
  t.props = {};
  t.name = name;
  t.type = type;
  t.homieDevice = homieDevice;
  t.mqttTopic = t.homieDevice.mqttTopic + '/' + t.name;

}

var proto = HomieNode.prototype;

proto.advertise = function(propName, setter) {
  var t = this;
  return t.props[propName] = new HomieProperty(t, propName, setter);
}

proto.advertiseRange = function(propName, start, end, setter) {
  var t = this;
  var prop = t.props[propName] = new HomieProperty(t, propName, setter);
  prop.setRange(start, end);
  return prop;
}

// Called on mqtt client connect
proto.onConnect = function() {
  var t = this;

  // Announce properties to MQTT
  var mqttClient = t.homieDevice.mqttClient;
  mqttClient.publish(t.mqttTopic + '/$type', t.type, {retain:true});
  var ads = [];
  _.each(t.props, function(prop){
    var adMsg = prop.name;
    if (prop.rangeStart !== null) {
      adMsg += '[' + prop.rangeStart + '-' + prop.rangeEnd + ']';
    }
    if (prop.setter) {
      adMsg += ':settable'
    }
    ads.push(adMsg);
  })
  mqttClient.publish(t.mqttTopic + '/$properties', ads.join(','), {retain:true});

}
