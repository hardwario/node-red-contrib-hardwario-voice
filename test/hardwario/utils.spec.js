let assert = require("assert");
let utils = require("../../hardwario/utils");

describe("Utils", () => {
  describe("checkIfArray", () => {
    const runs = [
      {
        it: "''",
        options: `[{"payload": '"#ffffff"', "topic": "node/power-controller:0/led-strip/-/color/set"}]`,
        valid: true
      },
      {
        it: '""',
        options: `[{"payload": ""#ffffff"", "topic": "node/power-controller:0/led-strip/-/color/set"}]`,
        valid: true
      },
      {
        it: '``',
        options: '[{"payload": `"ffffff"`, "topic": "node/power-controller:0/led-strip/-/color/set"}]',
        valid: true
      },
      { it: "no array", options: "{not an array}", valid: false }
    ];

    runs.forEach(run => {
      it(`should check array with ${run.it}`, () => {
        const arr = run.options;
        assert.equal(run.valid, utils.checkIfArray(arr).valid);
      });
    });
  });
});
