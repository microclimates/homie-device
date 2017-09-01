Homie Device
============

[![NPM](https://nodei.co/npm/homie-device.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/homie-device/)&nbsp;&nbsp;
[![Build Status](https://secure.travis-ci.org/microclimates/homie-device.svg?branch=master)](https://travis-ci.org/microclimates/homie-device)&nbsp;&nbsp;
[release notes](https://github.com/microclimates/homie-device/blob/master/History.md)

This is a NodeJS port of the [Homie convention](https://github.com/marvinroger/homie) for devices interacting on an MQTT message bus.

It is modeled after the great work done for [ESP8266 devices](https://github.com/marvinroger/homie-esp8266), with the goal of not only following the Homie Convention, but at adhering to the implementation interface so both message and API interfaces are familiar.

Quick Start
-----------

First, get a local MQTT broker running and a window opened subscribing to the 'devices/#' topic.

Next, add these lines to an index.js file and run it:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('bare-minimum');
myDevice.setup();
```

Congratulations, you've got a running Homie device! 

Take a look at the messages on your MQTT bus under devices/bare-minimum. Then ctrl-c the program and watch the broker administer the will.

Adding a Node
-------------

Devices aren't much use until they have some nodes and properties. Place the following into the index.js file and run it again:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test-node');
myNode.advertise('my-property-1');
myNode.advertiseRange('my-property-2', 0, 10);
myDevice.setup();
```

Publishing a Property
---------------------

Publishing properties has the same interface as the Homie ESP8266 implementation:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test-node');
myNode.advertise('my-property-1');
myDevice.setup();

myNode.setProperty('my-property-1').send('property-value');
```

Settable Properties
-------------------

To set properties from MQTT messages, add a setter function when advertising the property:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test-node');
myNode.advertise('my-property-1').settable(function(range, value) {
  myNode.setProperty('my-property-1').setRetained().send(value);
});
myDevice.setup();
```

Once running, publish a message to the `devices/my-device/my-node/my-property-1/set` topic.


Range Properties
----------------

Range properties work just like the Homie ESP8266 implementation:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');
var myNode = myDevice.node('my-node', 'test-node');
myNode.advertiseRange('my-property-2', 0 10).settable(function(range, value) {
  var index = range.index;
  myNode.setProperty('my-property-2').setRange(range).send(value);
});
myDevice.setup();
```

Now publish a message to the `devices/my-device/my-node/my-property-2[8]/set` topic.

Device Messages
---------------

Incoming messages to the device emit `messasge` events. You can listen for all messages to the 'devices/my-device/#' topic like this:

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('my-device');

myDevice.on('message', function(topic, value) {
  console.log('A message arrived on topic: ' + topic + ' with value: ' + value);
});

myDevice.setup();
```

Now publish a message to the `devices/my-device/my-node/my-property-2[8]/set` topic.

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

Quiet Setup
-----------

If you don't want the startup message, pass `true` to setup `myDevice.setup(quiet = true)`.

```
var HomieDevice = require('homie-device');
var myDevice = new HomieDevice('bare-minimum');
myDevice.setup(quiet = true);
```


Contributors
------------
<table id="contributors"><tr><td><img width="124" src="https://avatars2.githubusercontent.com/u/373538?v=4"><a href="https://github.com/lorenwest">lorenwest</a></td></tr></table>

License
-------

May be freely distributed under the [MIT license](https://raw.githubusercontent.com/microclimates/homie-device/master/LICENSE).

Copyright (c) 2017 Loren West 
[and other contributors](https://github.com/microclimates/homie-device/graphs/contributors)

