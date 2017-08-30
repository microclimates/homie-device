const expect    = require("chai").expect;
const Homie = require('..');

describe("Homie Device", function() {
  describe("Instantiation", function() {
    var testDevice = new Homie('bare-minimum', '1.0.0');
    it("creates a class of the correct type", function() {
      expect(testDevice).to.be.an.instanceOf(Homie);
    });
  });

});
