var expect = require("chai").expect;
var proxyquire = require('proxyquire').noPreserveCache();
var quietSetup = true;
var mqtt = require('./mqttStub');
// var mqtt = require('mqtt'); // Uncomment to test with a live broker
var HomieDevice = proxyquire('..', {mqtt: mqtt});

describe("Homie Device", function() {

  describe("Instantiation", function() {

    var testDevice = new HomieDevice('homie-device-test');
    it("creates a class of type HomieDevice", function() {
      expect(testDevice).to.be.an.instanceOf(HomieDevice);
    });
    it("creates a class with a string device_id constructor", function() {
      expect(testDevice.config.device_id).to.equal('homie-device-test');
    });

    var testDevice = new HomieDevice({name: 'homie-device test suite', device_id: 'homie-device-test', settings:{arg1:'value1'}});
    it("creates a class with a config object constructor", function() {
      expect(testDevice.config.device_id).to.equal('homie-device-test');
      expect(testDevice.config.name).to.equal('homie-device test suite');
    });

    it("allows the config object to maintain defaults", function() {
      expect(testDevice.config.mqtt.host).to.equal('localhost');
    });

    it("allows the config object to provide device specific settings", function() {
      expect(testDevice.config.settings.arg1).to.equal('value1');
    });

    it("allows the client to set firmware", function() {
      testDevice.setFirmware('my-firmware','0.2.1');
      expect(testDevice.firmwareName).to.equal('my-firmware');
      expect(testDevice.firmwareVersion).to.equal('0.2.1');
    });

  });

  describe("MQTT Connection", function() {

    var testDevice = new HomieDevice('homie-device-test');
    it("emits the connect message on setup()", function(done) {
      testDevice.on('connect', function() {
        done();
      });
      testDevice.setup(quietSetup);
    });

    it("emits the disconnect message on end()", function(done) {
      testDevice.on('disconnect', function() {
        done();
      });
      testDevice.end();
    });

  });

  describe("Publish / Subscribe", function() {

    var numMsgs = 0;
    it("emits all device messages as 'message' events", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      testDevice.on('message', function(topic, msg) {
        if (++numMsgs == 6) {
          testDevice.end();
          done();
        }
      });
      testDevice.setup(quietSetup);
    });

    it("can subscribe to a sub-topic individually", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      testDevice.on('message:$name', function(msg) {
        if (msg == 'homie-device-test') {
          testDevice.end();
          done();
        }
      });
      testDevice.setup(quietSetup);
    });

  });

  describe("Broadcast messages", function() {

    var time = '' + Date.now();
    it("emits the 'broadcast' event on device/$broadcast/... messages", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      testDevice.on('broadcast', function(topic, msg) {
        if (topic != 'longtime') {return;}
        expect(topic).to.equal('longtime');
        expect(msg).to.equal(time);
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);

      // Simulate an out-of-band publish
      setTimeout(function() {
        testDevice.mqttClient.publish('devices/$broadcast/longtime', time);
      }, 200);

    });

  });

  describe("Stats publishing", function() {

    var testDevice = new HomieDevice('homie-device-test');
    var numMsgs = 0;
    var firstUptime = null;
    it("publishes device stats at a determined interval", function(done) {
      testDevice.on('stats-interval', function() {
         if (++numMsgs == 3) {
           testDevice.end();
           done();
         }
      });
      testDevice.statsInterval = .3;
      testDevice.setup(quietSetup);
    });

  });

});
