Homie Device
============

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
<table id="contributors"><tr><td><img src=https://avatars2.githubusercontent.com/u/373538?v=4><a href="https://github.com/lorenwest">lorenwest</a></td><td><img src=https://avatars1.githubusercontent.com/u/25829?v=4><a href="https://github.com/markstos">markstos</a></td><td><img src=https://avatars3.githubusercontent.com/u/447151?v=4><a href="https://github.com/elliotttf">elliotttf</a></td><td><img src=https://avatars0.githubusercontent.com/u/66902?v=4><a href="https://github.com/leachiM2k">leachiM2k</a></td><td><img src=https://avatars1.githubusercontent.com/u/791137?v=4><a href="https://github.com/josx">josx</a></td><td><img src=https://avatars2.githubusercontent.com/u/133277?v=4><a href="https://github.com/enyo">enyo</a></td></tr><tr><td><img src=https://avatars3.githubusercontent.com/u/1077378?v=4><a href="https://github.com/arthanzel">arthanzel</a></td><td><img src=https://avatars2.githubusercontent.com/u/1656140?v=4><a href="https://github.com/eheikes">eheikes</a></td><td><img src=https://avatars0.githubusercontent.com/u/355800?v=4><a href="https://github.com/diversario">diversario</a></td><td><img src=https://avatars3.githubusercontent.com/u/138707?v=4><a href="https://github.com/th507">th507</a></td><td><img src=https://avatars2.githubusercontent.com/u/506460?v=4><a href="https://github.com/Osterjour">Osterjour</a></td><td><img src=https://avatars0.githubusercontent.com/u/842998?v=4><a href="https://github.com/nsabovic">nsabovic</a></td></tr><tr><td><img src=https://avatars0.githubusercontent.com/u/5138570?v=4><a href="https://github.com/ScionOfBytes">ScionOfBytes</a></td><td><img src=https://avatars2.githubusercontent.com/u/2529835?v=4><a href="https://github.com/simon-scherzinger">simon-scherzinger</a></td><td><img src=https://avatars1.githubusercontent.com/u/175627?v=4><a href="https://github.com/axelhzf">axelhzf</a></td><td><img src=https://avatars3.githubusercontent.com/u/7782055?v=4><a href="https://github.com/benkroeger">benkroeger</a></td><td><img src=https://avatars3.githubusercontent.com/u/1443067?v=4><a href="https://github.com/IvanVergiliev">IvanVergiliev</a></td><td><img src=https://avatars1.githubusercontent.com/u/8839447?v=4><a href="https://github.com/jfelege">jfelege</a></td></tr><tr><td><img src=https://avatars2.githubusercontent.com/u/1246875?v=4><a href="https://github.com/jaylynch">jaylynch</a></td><td><img src=https://avatars1.githubusercontent.com/u/145742?v=4><a href="https://github.com/jberrisch">jberrisch</a></td><td><img src=https://avatars1.githubusercontent.com/u/9355665?v=4><a href="https://github.com/kgoerlitz">kgoerlitz</a></td><td><img src=https://avatars3.githubusercontent.com/u/1918551?v=4><a href="https://github.com/nitzan-shaked">nitzan-shaked</a></td><td><img src=https://avatars3.githubusercontent.com/u/3058150?v=4><a href="https://github.com/robertrossmann">robertrossmann</a></td><td><img src=https://avatars2.githubusercontent.com/u/498929?v=4><a href="https://github.com/roncli">roncli</a></td></tr><tr><td><img src=https://avatars2.githubusercontent.com/u/1355559?v=4><a href="https://github.com/superoven">superoven</a></td><td><img src=https://avatars2.githubusercontent.com/u/54934?v=4><a href="https://github.com/wmertens">wmertens</a></td><td><img src=https://avatars3.githubusercontent.com/u/2842176?v=4><a href="https://github.com/XadillaX">XadillaX</a></td><td><img src=https://avatars1.githubusercontent.com/u/4425455?v=4><a href="https://github.com/ncuillery">ncuillery</a></td><td><img src=https://avatars1.githubusercontent.com/u/618330?v=4><a href="https://github.com/adityabansod">adityabansod</a></td><td><img src=https://avatars3.githubusercontent.com/u/270632?v=4><a href="https://github.com/thetalecrafter">thetalecrafter</a></td></tr></table>

License
-------

May be freely distributed under the [MIT license](https://raw.githubusercontent.com/lorenwest/homie-device/master/LICENSE).

Copyright (c) 2017 Loren West 
[and other contributors](https://github.com/lorenwest/homie-device/graphs/contributors)

