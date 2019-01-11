var expect = require("chai").expect;
var proxyquire = require('proxyquire').noPreserveCache();
var quietSetup = true;
var mqtt = require('./mqttStub');
// var mqtt = require('mqtt'); // Uncomment to test with a live broker
var HomieDevice = proxyquire('..', {mqtt: mqtt});
var HomieNode = require('../lib/homieNode');

describe("Homie Node", function() {

  describe("Instantiation", function() {

    var testDevice = new HomieDevice('homie-device-test');
    var testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');

    it("creates a class of type HomieNode", function() {
      expect(testNode1).to.be.an.instanceOf(HomieNode);
    });
    it("constructor arguments are correct", function() {
      expect(testNode1.name).to.equal('test-node-1');
      expect(testNode1.type).to.equal('test-node');
    });

  });

  describe("MQTT Connection", function() {

    var testDevice = new HomieDevice('homie-device-test');
    var testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');

    it("emits the connect message on setup()", function(done) {
      testNode1.on('connect', function() {
        done();
      });
      testDevice.setup(quietSetup);
    });

    it("emits the disconnect message on end()", function(done) {
      testNode1.on('disconnect', function() {
        done();
      });
      testDevice.end();
    });

    it("publishes the node on connect", function(done) {
      testDevice = new HomieDevice('homie-device-test');
      testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
      testDevice.on('message:test-node-1/$type', function(msg) {
        expect(msg).to.equal('test-node');
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);
    });

    it("publishes the node name on connect", function(done) {
      testDevice = new HomieDevice('homie-device-test');
      testNode1 = testDevice.node('test-node-1', 'friendly Name', 'test-node');
      testDevice.on('message:test-node-1/$name', function(msg) {
        expect(msg).to.equal('friendly Name');
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);
    });

    it("publishes the node list on connect", function(done) {
      testDevice = new HomieDevice('homie-device-test');
      testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
      testDevice.on('message:$nodes', function(msg) {
        expect(msg).to.equal('test-node-1');
        testDevice.end();
        done();
      });
      testDevice.setup(quietSetup);
    });

  });

  describe("Stats publishing", function() {

    var testDevice = new HomieDevice('homie-device-test');
    var testNode1 = testDevice.node('test-node-1', 'friendly Name','test-node');
    var numMsgs = 0;
    it("publishes node stats at a determined interval", function(done) {
      testNode1.on('stats-interval', function() {
         if (++numMsgs == 3) {
           testDevice.end();
           done();
         }
      });
      testDevice.statsInterval = .1;
      testDevice.setup(quietSetup);
    });

  });

});
