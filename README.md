Homie Device
============

[![NPM](https://nodei.co/npm/homie-device.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/homie-device/)&nbsp;&nbsp;
[![Build Status](https://secure.travis-ci.org/lorenwest/node-config.svg?branch=master)](https://travis-ci.org/lorenwest/homie-device)&nbsp;&nbsp;
[release notes](https://github.com/lorenwest/homie-device/blob/master/History.md)

This is a NodeJS port of the [Homie convention](https://github.com/marvinroger/homie) for devices interacting on an MQTT message bus.

It is modeled after the great work done for [ESP8266 devices](https://github.com/marvinroger/homie-esp8266), with the goal of not only following the Homie Convention, but at adhering to the implementation interface so both message and API interfaces are familiar.

Quick Start
-----------

To create and publish a device, add these lines to an index.js file and run it:

```
const HomieDevice = require('homie-device');

let bareMinimum = new HomieDevice('bare-minimum', '1.0.0');
```


Congratulations! Take a look at the messages on your MQTT bus under devices/bare-minimum.

Adding a Node
-------------

var gmtTimeNode = testDevice.registerNode('gmt-time', 'unix-time');
var localTimeNode = testDevice.registerNode('local-time', 'local-time-format');
var tzNode = testDevice.registerNode('local-time', 'local-time-format');

Contributors
------------
<table id="contributors"><tr><td><img height="124" src="https://avatars2.githubusercontent.com/u/373538?v=4"><a href="https://github.com/lorenwest">lorenwest</a></td></tr></table>

License
-------

May be freely distributed under the [MIT license](https://raw.githubusercontent.com/lorenwest/homie-device/master/LICENSE).

Copyright (c) 2017 Loren West 
[and other contributors](https://github.com/lorenwest/homie-device/graphs/contributors)

