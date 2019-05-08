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
    var testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
    var testProperty1 = testNode1.advertise('test-property-1');
    var testProperty2 = testNode1.advertise('test-property-2').settable(function(){});

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

  });

  describe("MQTT Connection", function() {

    var testDevice;
    var testNode1;
    var testProperty1;
    var expectConnectMessage;

    var expectConnectMessage = function(topic, expected, done) {
      testDevice.once('message:test-node-1/'+topic, function(msg) {
        expect(msg).to.equal(expected);
        testDevice.end();
      });
      testDevice.once('disconnect', done);
      testDevice.setup(quietSetup);
    };

    beforeEach(function() {
      testDevice = new HomieDevice('homie-device-test');
      testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
      testProperty1 = testNode1.advertise('test-property-1');
    });

    it("advertises all properties on connect", function(done) {
      testNode1.advertise('test-property-2').settable(function(){});
      expectConnectMessage('$properties', 'test-property-1,test-property-2', done);
    });

    it("advertises name attribute on connect", function(done) {
      testProperty1.setName('Test Property 1');
      expectConnectMessage('test-property-1/$name', 'Test Property 1', done);
    });

    it("advertises retained attribute on connect", function(done) {
      testProperty1.setRetained(false);
      expectConnectMessage('test-property-1/$retained', 'false', done);
    });

    it("advertises settable attribute on connect", function(done) {
      expectConnectMessage('test-property-1/$settable', 'false', done);
    });

    it("advertises unit attribute on connect", function(done) {
      testProperty1.setUnit('%');
      expectConnectMessage('test-property-1/$unit', '%', done);
    });

    it("advertises datatype attribute on connect", function(done) {
      testProperty1.setDatatype("integer");
      expectConnectMessage('test-property-1/$datatype', 'integer', done);
    });

    it("advertises format attribute on connect", function(done) {
      testProperty1.setFormat('10:15')
      expectConnectMessage('test-property-1/$format', '10:15', done);
    });

    it("advertises array format attribute on connect", function(done) {
      testProperty1.setFormat(['foo', 'bar']);
      expectConnectMessage('test-property-1/$format', 'foo,bar', done);
    });
  });

  describe("Property publish", function() {


    it("publishes properties via the node like the mqtt library", function(done) {
      var testDevice = new HomieDevice('homie-device-test');
      var testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
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
      var testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
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
      var testNode1 = testDevice.node('test-node-1', 'friendly Name', 'test-node');
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

    it("calls the setter when the property is set and device name isn't device id", function(done) {
      var testDevice = new HomieDevice({name: 'Homie device test', device_id: 'homie-device-test'});
      var testNode1 = testDevice.node('test-node-1', 'friendly Name', 'test-node');
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
      var testNode1 = testDevice.node('test-node-1', 'friendly Name', 'test-node',0,100);
      var testProperty1 = testNode1.advertise('test-property-3').settable(function(range, value) {
        expect(range.isRange).to.equal(true);
        expect(range.index).to.equal(42);
        expect(value).to.equal('new value');

        // Make sure the setRange(range) publishes to the proper topic
        testDevice.on('message:test-node-1_42/test-property-3', function(newValue) {
          expect(newValue).to.equal(value);
          testDevice.end();
          done();
        })
        testProperty1.setRetained(false).setRange(range.index).send(value);
      });
      testDevice.setup(quietSetup);

      // Simulate an out-of-band publish
      setTimeout(function() {
        testDevice.mqttClient.publish('devices/homie-device-test/test-node-1_42/test-property-3/set', 'new value');
      }, 200);

    });

  });

});
