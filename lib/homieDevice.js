var _ = require('lodash');
var pkgJson = require('../package.json');
var homieVersion = '2.0.0';
var homieImplName = 'nodejs:' + pkgJson.name;
var homieImplVersion = pkgJson.version;
var mqtt = require('mqtt');
var HomieNode = require('./homieNode');
var EventEmitter = require('events').EventEmitter;

const DEFAULT_CONFIG = {
  "name": "",
  "device_id": "unknown",
  "mqtt": {
    "host": "localhost",
    "port": 1883,
    "base_topic": "devices/",
    "auth": false,
    "username": null,
    "password": null,
  },
  "settings": {
  }
}

/* Constructor
 *
 * Construct a new HomieDevice with a device_id or a config object containing some or all of:
 *
 * {
 *   "name": "Bare Minimum",
 *   "device_id": "bare-minimum",
 *   "mqtt": {
 *     "host": "localhost",
 *     "port": 1883,
 *     "base_topic": "devices/",
 *     "auth": false,
 *     "username": "user",
 *     "password": "pass"
 *   },
 *   "settings": {
 *     "percentage": 55 // device settings
 *   }
 * }
 *
 * Would like, but not implemented:
 *
 *   "wifi": {
 *     "ssid": "ssid",
 *     "password": "pass"
 *   },
 *   "ota": {
 *     "enabled": true
 *   }
 *
 */
var HomieDevice = module.exports = function(config) {

  var t = this;
  if (_.isString(config)) {
    config = {name: config, device_id: config};
  }
  t.config = _.extend({}, DEFAULT_CONFIG, config);

  t.name = t.config.name;
  t.mqttTopic = t.config.mqtt.base_topic + t.config.device_id;
  t.startTime = Date.now();

  t.nodes = {};
  t.firmwareName = null;
  t.firmwareVersion = null;
  t.statsInterval = 60;
  t.mqttClient = null;
}

require('util').inherits(HomieDevice, EventEmitter);
var proto = HomieDevice.prototype;

proto.setFirmware = function(firmwareName, firmwareVersion) {
  var t = this;
  t.firmwareName = firmwareName;
  t.firmwareVersion = firmwareVersion;
}

proto.node = function(name, type) {
  var t = this;
  return t.nodes[name] = new HomieNode(t, name, type);
}

// Start the device
proto.setup = function(quiet) {
  var t = this;
  var mqttServer = 'mqtt://' + t.config.mqtt.host + ':' + t.config.mqtt.port;
  var opts = {
    will: {
      topic: t.mqttTopic + '/$online',
      payload: 'false',
      qos: 0,
      retain: true
    }
  }
  if (t.config.mqtt.auth) {
    opts.username = t.config.mqtt.username;
    opts.password = t.config.mqtt.password;
  }
  t.mqttClient = mqtt.connect(mqttServer, opts);

  t.mqttClient.on('connect', function(connack) {
    t.onConnect();
  })

  t.mqttClient.on('close', function() {
    t.onDisconnect();
  })

  t.mqttClient.on('message', function (topic, message) {
    t.onMessage(topic, message.toString());
  })

  t.mqttClient.subscribe(t.mqttTopic + '/#');
  t.mqttClient.subscribe(t.config.mqtt.base_topic + '$broadcast/#');

  if (!quiet) {
    console.log('Connected Homie ' + t.mqttTopic + ' to ' + mqttServer);
  }
}

// Stop the device
proto.end = function() {
  var t = this;
  t.mqttClient.publish(t.mqttTopic + '/$online', 'false');
  t.mqttClient.end();
}

// Called on mqtt client connect
proto.onConnect = function() {
  var t = this;

  // Advertise device properties
  t.mqttClient.publish(t.mqttTopic + '/$homie', homieVersion, {retain:true});
  t.mqttClient.publish(t.mqttTopic + '/$implementation', homieImplName, {retain:true});
  t.mqttClient.publish(t.mqttTopic + '/$implementation/version', homieImplVersion, {retain:true});
  if (t.firmwareName) {
    t.mqttClient.publish(t.mqttTopic + '/$fw/name', t.firmwareName, {retain:true});
    t.mqttClient.publish(t.mqttTopic + '/$fw/version', t.firmwareVersion, {retain:true});
  }
  t.mqttClient.publish(t.mqttTopic + '/$name', t.config.name, {retain:true});
  t.mqttClient.publish(t.mqttTopic + '/$online', 'true', {retain:true});
  t.mqttClient.publish(t.mqttTopic + '/$stats/interval', '' + t.statsInterval, {retain:true});

  // Maybe one day we'll do these.
  // t.mqttClient.publish(t.mqttTopic + '/$mac', ?, {retain:true});
  // t.mqttClient.publish(t.mqttTopic + '/$localip', ?, {retain:true});
  // t.mqttClient.publish(t.mqttTopic + '/$stats/signal', ?, {retain:true});

  t.emit('connect');
  _.each(t.nodes, function(node){
    node.onConnect();
  })

  // Call the stats interval now, and at regular intervals
  t.onStatsInterval();
  t.interval = setInterval(function() {
    t.onStatsInterval();
  }, t.statsInterval * 1000);

}

// Called on mqtt client disconnect
proto.onDisconnect = function() {
  var t = this;
  t.interval = clearInterval(t.interval);
  _.each(t.nodes, function(node){
    node.onDisconnect();
  })
  t.emit('disconnect');
}

// Called on every stats interval
proto.onStatsInterval = function() {
  var t = this;
  var uptime = (Date.now() - t.startTime) / 1000;
  t.mqttClient.publish(t.mqttTopic + '/$stats/uptime', '' + _.round(uptime,0), {retain:false});
  _.each(t.nodes, function(node){
    node.onStatsInterval();
  })
  t.emit('stats-interval');
}

// Called when a device message is received
proto.onMessage = function(topic, msg) {
  var t = this;
  var parts = topic.split('/');
  var deviceTopic = parts.slice(2).join('/');

  // Emit broadcast messages to broadcast listeners
  if (parts[1] == '$broadcast') {
    t.emit('broadcast', deviceTopic, msg);
    return;
  }

  // Emit to listeners of all device topics
  t.emit('message', deviceTopic, msg);

  // Emit to listeners of the specific device topic
  t.emit('message:' + deviceTopic, msg);

  // Invoke property setters if this is a property set message
  if (parts[1] == t.name && parts[4] == 'set') {
    var nodeName = parts[2];
    var propName = parts[3];
    var value = msg;
    var node = t.nodes[nodeName];
    if (node) {
      var range = {
        isRange: false,
        index: 0
      }
      var leftBracket = propName.indexOf('[');
      var rightBracket = propName.indexOf(']');
      if (leftBracket > 0 && rightBracket > 0 && leftBracket < rightBracket) {
        range.isRange = true;
        range.index = +propName.substr(leftBracket + 1, rightBracket - leftBracket - 1);
        propName = propName.substr(0,leftBracket);
      }
      var prop = node.props[propName];
      if (prop && _.isFunction(prop.setter)) {
        // This interface is consistent with esp8266 homie
        prop.setter(range, value);
      }
    }
  }

}

/*

devices/two-relay-test/$homie 2.0.0
devices/two-relay-test/$implementation esp8266
devices/two-relay-test/$implementation/config {"name":"Relay 2 Test","device_id":"two-relay-test","wifi":{"ssid":"PrettyFlyForAWifi"},"mqtt":{"host":"192.168.43.178","port":1883,"base_topic":"devices/","auth":false},"ota":{"enabled":true},"settings":{}}
devices/two-relay-test/$implementation/version 2.0.0
devices/two-relay-test/$implementation/ota/enabled true
devices/two-relay-test/$implementation/ota/status 200
devices/two-relay-test/$mac A0:20:A6:16:A7:7D
devices/two-relay-test/esp/$type microcontroller
devices/two-relay-test/esp/$properties interval[0-600]:settable,reboot[0-1]:settable,uptime,memfree
devices/two-relay-test/esp/uptime 116
devices/two-relay-test/esp/memfree 24856
devices/two-relay-test/button/$type button
devices/two-relay-test/button/$properties down
devices/two-relay-test/identity/$type deviceID
devices/two-relay-test/identity/$properties id:settable,qr:settable,ident[1-60]:settable,splash-secs[0-60]:settable
devices/two-relay-test/identity/id g7zn
devices/two-relay-test/lcd/$type screen
devices/two-relay-test/lcd/$properties msg[1-4]:settable,alert[1-60]:settable,frames:settable
devices/two-relay-test/lcd/frames id,relay1,relay2
devices/two-relay-test/lcd/all-frames id,relay1,relay2,msg_1,msg_2,msg_3,msg_4
devices/two-relay-test/clock/$type clock
devices/two-relay-test/clock/$properties 24hr[0-1]:settable
devices/two-relay-test/wifi/$type wifi
devices/two-relay-test/wifi/$properties quality[0-100]
devices/two-relay-test/wifi/quality 84
devices/two-relay-test/relay/$type relay
devices/two-relay-test/relay/$properties name[1-2]:settable,value[1-2]:settable,on-label[1-2]:settable,off-label[1-2]:settable
devices/two-relay-test/relay/value_1 2
devices/two-relay-test/relay/value_2 1
devices/two-relay-test/$name Relay 2 Test
devices/two-relay-test/$localip 192.168.43.123
devices/two-relay-test/$stats/interval 60
devices/two-relay-test/$stats/signal 76
devices/two-relay-test/$stats/uptime 3
devices/two-relay-test/$fw/name mc-relay2
devices/two-relay-test/$fw/version 1.1.0
devices/two-relay-test/$fw/checksum e98a552aae1ecdd6f190faf2a0683e99
devices/two-relay-test/$online false

*/
