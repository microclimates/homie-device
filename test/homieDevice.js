var expect    = require("chai").expect;
var HomieDevice = require('..');

describe("Homie Device", function() {

  describe("Instantiation", function() {

    var testDevice = new HomieDevice('bare-minimum');
    it("creates a class of the correct type", function() {
      expect(testDevice).to.be.an.instanceOf(HomieDevice);
    });
    it("creates a class with a string device_id constructor", function() {
      expect(testDevice.config.device_id).to.equal('bare-minimum');
    });

    var testDevice = new HomieDevice({name: 'Bare Minimum', device_id: 'bare-minimum', settings:{arg1:'value1'}});
    it("creates a class with a config object constructor", function() {
      expect(testDevice.config.device_id).to.equal('bare-minimum');
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

});
