var expect = require("chai").expect;
var proxyquire = require('proxyquire').noPreserveCache();
var quietSetup = true;
var mqtt = require('./mqttStub');
// var mqtt = require('mqtt'); // Uncomment to test with a live broker
var HomieDevice = proxyquire('..', {mqtt: mqtt});
var HomieProperty = require('../lib/homieProperty');

describe("Homie Property", function() {

  describe("Instantiation", function() {

    var testDevice = new HomieDevice('homie-device-test');
    var testNode1 = testDevice.node('test-node-1', 'test-node');
    var testProperty1 = testNode1.advertise('test-property-1');
    var testProperty2 = testNode1.advertise('test-property-2').settable(function(){});
    var testProperty3 = testNode1.advertiseRange('test-property-3',0,100).settable(function(){});

    it("creates a class of type HomieProperty", function() {
      expect(testProperty1).to.be.an.instanceOf(HomieProperty);
    });

    it("creates a non-settable property", function() {
      expect(testProperty1.name).to.equal('test-property-1');
    });

    it("creates a settable property", function() {
      expect(testProperty2.name).to.equal('test-property-2');
      expect(testProperty2.setter).to.be.a('function');
    });

    it("creates a range/settable property", function() {
      expect(testProperty3.name).to.equal('test-property-3');
      expect(testProperty3.setter).to.be.a('function');
      expect(testProperty3.rangeStart).to.equal(0);
      expect(testProperty3.rangeEnd).to.equal(100);
    });

  });

  describe("MQTT Connection", function() {

    var testDevice = new HomieDevice('homie-device-test');
    var testNode1 = testDevice.node('test-node-1', 'test-node');
    var testProperty1 = testNode1.advertise('test-property-1');
    var testProperty2 = testNode1.advertise('test-property-2').settable(function(){});
    var testProperty3 = testNode1.advertiseRange('test-property-3',0,100).settable(function(){});

    it("advertises all properties on connect", function(done) {
      testDevice.on('message:test-node-1/$properties', function(msg) {
        expect(msg).to.equal('test-property-1,test-property-2:settable,test-property-3[0-100]:settable');
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);
    });

  });

  describe("Property publish", function() {


    it("publishes properties via the node like the mqtt library", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      var testNode1 = testDevice.node('test-node-1', 'test-node');
      var testProperty1 = testNode1.advertise('test-property-1');
      testNode1.on('connect', function() {
        testNode1.setProperty('test-property-1').setRetained(true).send('property1 value');
      });
      testDevice.on('message:test-node-1/test-property-1', function(msg) {
        if (msg !== 'property1 value') {return;}  // prior retained values
        expect(msg).to.equal('property1 value');
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);
    });

    it("publishes properties directly", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      var testNode1 = testDevice.node('test-node-1', 'test-node');
      var testProperty1 = testNode1.advertise('test-property-1');
      testNode1.on('connect', function() {
        testProperty1.setRetained(true).send('property1 value');
      });
      testDevice.on('message:test-node-1/test-property-1', function(msg) {
        if (msg !== 'property1 value') {return;}  // prior retained values
        expect(msg).to.equal('property1 value');
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);
    });

  });

  describe("Settable properties", function() {

    it("calls the setter when the property is set", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      var testNode1 = testDevice.node('test-node-1', 'test-node');
      var testProperty1 = testNode1.advertise('test-property-1').settable(function(range, value) {
        expect(range.isRange).to.equal(false);
        expect(value).to.equal('set value');
        testProperty1.setRetained(true).send(value);
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);

      // Simulate an out-of-band publish
      setTimeout(function() {
        testDevice.mqttClient.publish('devices/homie-device-test/test-node-1/test-property-1/set', 'set value');
      }, 200);

    });

    it("calls the setter with a range property", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      var testNode1 = testDevice.node('test-node-1', 'test-node');
      var testProperty1 = testNode1.advertiseRange('test-property-3',0,100).settable(function(range, value) {
        expect(range.isRange).to.equal(true);
        expect(range.index).to.equal(42);
        expect(value).to.equal('new value');

        // Make sure the setRange(range) publishes to the proper topic
        testDevice.on('message:test-node-1/test-property-3_42', function(newValue) {
          expect(newValue).to.equal(value);
          testDevice.end();
          done();
        })
        testProperty1.setRetained(false).setRange(range).send(value);
      });
      testDevice.setup(quietSetup);

      // Simulate an out-of-band publish
      setTimeout(function() {
        testDevice.mqttClient.publish('devices/homie-device-test/test-node-1/test-property-3_42/set', 'new value');
      }, 200);

    });

  });

});
