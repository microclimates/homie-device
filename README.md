Homie Device
============

[![NPM](https://nodei.co/npm/homie-device.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/homie-device/)&nbsp;&nbsp;
[![Build Status](https://secure.travis-ci.org/microclimates/homie-device.svg?branch=master)](https://travis-ci.org/microclimates/homie-device)&nbsp;&nbsp;
[release notes](https://github.com/microclimates/homie-device/blob/master/History.md)

This is a NodeJS port of the [Homie convention](https://github.com/marvinroger/homie) for lightweight IoT device interaction on an [MQTT](https://en.wikipedia.org/wiki/MQTT) message bus.

It is modeled after the great work done for [ESP8266 devices](https://github.com/marvinroger/homie-esp8266), with the goal of not only following the Homie Convention, but at adhering to the implementation interface so both message and API interfaces are familiar.

It's great for mixing ESP8266 devices with Raspberry Pi and other linux or windows based systems on the same MQTT network.

Features
--------

* Device, Node, and Property with ESP8266-like interface
* Auto MQTT connect with optional username/password
* Auto MQTT re-connect
* Device config matching ESP8266 config JSON
* Periodic $stats/uptime publishing
* $online will
* Device topic events
* Broadcast message events
* Periodic stats interval events
* Device/node/property announcement on connect
* Property send with retained value
* Settable properties
* Property ranges
* Lightweight
* Full test coverage

Quick Start
-----------

First, get a local [MQTT broker](https://mosquitto.org/download/) running and a window opened subscribing to the 'devices/#' topic.

Next, add these lines to an index.js file and run it:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('bare-minimum');
myDevice.setup();
```

Congratulations, you've got a running Homie device! 

Take a look at the messages on your MQTT bus under devices/bare-minimum. Then ctrl-c the program and watch the broker administer the will.

Setting Firmware
----------------

To publish the firmware name & version, call `myDevice.setFirmware()`:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('bare-minimum');
myDevice.setFirmware('nodejs-test', '0.0.1');
myDevice.setup();
```

Adding a Node
-------------

Devices aren't much use until they have some nodes and properties. Place the following into the index.js file and run it again:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test node friendly name', 'test-node');
myNode.advertise('my-property-1').setName('Friendly Prop Name').setUnit('W').setDatatype('integer');
myDevice.setup();
```

Publishing a Property
---------------------

Publishing properties has the same interface as the Homie ESP8266 implementation:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test node friendly name', 'test-node');
myNode.advertise('my-property-1').setName('Friendly Prop Name').setUnit('W').setDatatype('integer');
myDevice.setup();

myNode.setProperty('my-property-1').send('property-value');
```

Settable Properties
-------------------

To set properties from MQTT messages, add a setter function when advertising the property:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test node friendly name', 'test-node');
myNode.advertise('my-property-1').setName('Friendly Prop Name').setUnit('W').setDatatype('string').settable(function(range, value) {
  myNode.setProperty('my-property-1').setRetained().send(value);
});
myDevice.setup();
```

Once running, publish a message to the `devices/my-device/my-node/my-property-1/set` topic.

Array Nodes
----------------

Array nodes are also supported by passing lower and upper bounds on the range when creating the node.

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');

var lowerBound = 0;
var upperBound = 10;
var myNode = myDevice.node('my-node', 'test node friendly name', 'test-node', lowerBound, upperBound);
```

Publishing a property to a specific node index can be done like this:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test node friendly name', 'test-node', 0, 10);
myNode.advertise('my-property-1');
myDevice.setup();

// Publishes 'property-value' to the 'devices/my-device/my-node_2/my-property-1' topic.
myNode.setProperty('my-property-1').setRange(2).send('property-value');
```

Setting a property on a specific node index can be done like this:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test node friendly name', 'test-node', 0, 10);
myNode.advertise('my-property-2').settable(function(range, value) {
  var index = range.index;
  myNode.setProperty('my-property-2').setRange(index).send(value);
});
myDevice.setup();
```

Now publish a message to the `devices/my-device/my-node_8/my-property-2/set` topic.

Device Messages
---------------

Incoming messages to the device emit `message` events. You can listen for all messages to the `devices/my-device/#` topic like this:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');

myDevice.on('message', function(topic, value) {
  console.log('A message arrived on topic: ' + topic + ' with value: ' + value);
});

myDevice.setup();
```

Now publish a message to the `devices/my-device/my-node/my-property-2_8/set` topic.

Topic Messages
--------------

You can listen for specific incoming topics by adding a listener to the `message:{topic}` event for the device:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');

myDevice.on('message:my/topic', function(value) {
  console.log('A message arrived on the my/topic topic with value: ' + value);
});

myDevice.setup();
```

Now publish a message to the `devices/my-device/my/topic` topic.

Broadcast Messages
------------------

You can listen to all `devices/$broadcast/#` messages by adding a listener to the `broadcast` event:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');

myDevice.on('broadcast', function(topic, value) {
  console.log('A broadcast message arrived on topic: ' + topic + ' with value: ' + value);
});

myDevice.setup();
```

Now publish a broadcast message to the `devices/$broadcast/some-topic` topic. All homie devices are exposed to broadcast messages.

Device Settings
---------------

To configure your device with external settings, pass a full or partial config object to the HomieDevice constructor. If you've worked with the Homie ESP8266 implementation, this will be familiar:

```
var HomieDevice = require('homie-device');
var config = {
  "name": "Bare Minimum",
  "device_id": "bare-minimum",
  "mqtt": {
    "host": "localhost",
    "port": 1883,
    "base_topic": "devices/",
    "auth": false,
    "username": "user",
    "password": "pass"
  },
  "settings": {
    "percentage": 55
  }
}
var myDevice = new HomieDevice(config);
myDevice.setup();
```

Connection
----------

The Homie device maintains an `isConnected` (true/false) state, and emits 
a `connect` and `disconnect` event as the device becomes connected with MQTT.

Quiet Setup
-----------

If you don't want the startup message, pass the quiet flag of `true` to setup `myDevice.setup(true)`.

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('bare-minimum');
myDevice.setup(true);
```

Contributors
------------
<table id="contributors"><tr><td><img width="124" src="https://avatars2.githubusercontent.com/u/373538?v=4"><br/><a href="https://github.com/lorenwest">lorenwest</a></td></tr></table>

License
-------

May be freely distributed under the [MIT license](https://raw.githubusercontent.com/microclimates/homie-device/master/LICENSE).

Copyright (c) 2017-2018 Loren West 
[and other contributors](https://github.com/microclimates/homie-device/graphs/contributors)

