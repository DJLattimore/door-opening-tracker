import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCompliance,
  mapFlightRow,
  parseDoorOpening
} from "../src/csvParser.js";
import {
  checkCompliance,
  getAircraftType,
  getTargetSeconds
} from "../src/compliance.js";

test("maps the QRS Door Opening (Mins.) header and parses its value", () => {
  const flight = mapFlightRow(
    {
      "Arr. Flt.": "123",
      "Equip.": "320",
      "Door Opening (Mins.)": "2:30"
    },
    0
  );

  assert.equal(flight.doorOpeningRaw, "2:30");
  assert.equal(flight.doorOpeningSeconds, 150);
  assert.equal(flight.metricMet, true);
});

test("compares narrow and wide door opening times at their thresholds", () => {
  assert.equal(parseDoorOpening("2:30"), 150);
  assert.equal(parseDoorOpening("3:30"), 210);
  assert.equal(calculateCompliance("320", 150), true);
  assert.equal(calculateCompliance("320", 151), false);
  assert.equal(calculateCompliance("787", 210), true);
  assert.equal(calculateCompliance("787", 211), false);
});

test("uses the shared compliance thresholds for parsed times", () => {
  assert.equal(getAircraftType(" 320 "), "NARROW");
  assert.equal(getAircraftType("787"), "WIDE");
  assert.equal(getTargetSeconds("NARROW"), 150);
  assert.equal(getTargetSeconds("WIDE"), 210);
  assert.equal(checkCompliance(parseDoorOpening("2:30"), 150), true);
  assert.equal(checkCompliance(parseDoorOpening("3:31"), 210), false);
});
