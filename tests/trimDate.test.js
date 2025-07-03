import { test } from "uvu";
import * as assert from "uvu/assert";
import { DateTime } from "luxon";
import { trimDate } from "../src/index.js";

// Start of Valentine's Day in UTC
const start = DateTime.fromISO("2023-02-14T00:00:00", { zone: "UTC" });

let datetime = [];
let x = [];

// ----- Generate full dataset (10 days, 240 hours) ----------------------------
for (let i = 0; i < 240; i++) {
  datetime[i] = start.plus({ hours: i }); // Luxon DateTime in UTC
  const val = 10 + 5 * Math.sin((i * Math.PI) / 12) + Math.random() * 6 - 3;
  x[i] = Math.round(val * 10) / 10;
}

// ----- Tests -----------------------------------------------------------------

test("trimming works for 'UTC'", () => {
  const timezone = "UTC";
  const trimmed = trimDate(datetime, x, timezone);
  const tz_start = trimmed.datetime[0].setZone(timezone);
  const tz_end = trimmed.datetime[239].setZone(timezone);

  assert.is(trimmed.datetime.length, 240);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);

  assert.ok(trimmed.datetime[0].equals(datetime[0]));
  assert.is(trimmed.datetime[0].zoneName, "UTC");
  assert.is(trimmed.x[0], x[0]);
});

test("trimming works for 'America/Los_Angeles'", () => {
  const timezone = "America/Los_Angeles";
  const trimmed = trimDate(datetime, x, timezone);
  const tz_start = trimmed.datetime[0].setZone(timezone);
  const tz_end = trimmed.datetime[215].setZone(timezone);

  assert.is(trimmed.datetime.length, 216);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);

  assert.ok(trimmed.datetime[0].equals(datetime[8]));
  assert.is(trimmed.datetime[0].zoneName, "UTC");
  assert.is(trimmed.x[0], x[8]);
});

test("trimming works for 'America/New_York'", () => {
  const timezone = "America/New_York";
  const trimmed = trimDate(datetime, x, timezone);
  const tz_start = trimmed.datetime[0].setZone(timezone);
  const tz_end = trimmed.datetime[215].setZone(timezone);

  assert.is(trimmed.datetime.length, 216);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);

  assert.ok(trimmed.datetime[0].equals(datetime[5]));
  assert.is(trimmed.datetime[0].zoneName, "UTC");
  assert.is(trimmed.x[0], x[5]);
});

test("trimming ignores partial trailing days", () => {
  const partialDatetime = datetime.slice(0, 238); // 9.9 days
  const partialX = x.slice(0, 238);
  const timezone = "UTC";

  const trimmed = trimDate(partialDatetime, partialX, timezone);
  assert.is(trimmed.datetime.length, 216); // 9 full days
  assert.ok(trimmed.datetime[0].zoneName === "UTC");
});

test("returns empty arrays for < 24 hours of data", () => {
  const shortDatetime = datetime.slice(0, 10);
  const shortX = x.slice(0, 10);
  const trimmed = trimDate(shortDatetime, shortX, "UTC");
  assert.equal(trimmed.datetime, []);
  assert.equal(trimmed.x, []);
});

test("trimmed datetime and x arrays stay aligned", () => {
  const timezone = "America/New_York";
  const trimmed = trimDate(datetime, x, timezone);
  for (let i = 0; i < trimmed.datetime.length; i++) {
    const ts = trimmed.datetime[i].toMillis();
    const originalIndex = datetime.findIndex((d) => d.toMillis() === ts);
    assert.is(trimmed.x[i], x[originalIndex]);
  }
});

test("throws on mismatched input lengths", () => {
  const badX = x.slice(0, 100);
  assert.throws(() => trimDate(datetime, badX, "UTC"));
});

test("throws if datetime values are not in UTC", () => {
  const local = datetime.map((dt) => dt.setZone("America/Los_Angeles", { keepLocalTime: true }));
  assert.throws(() => trimDate(local, x, "UTC"), /UTC/);
});

test("throws if any datetime value is not a Luxon DateTime", () => {
  const bad = [...datetime];
  bad[0] = new Date();
  assert.throws(() => trimDate(bad, x, "UTC"), /DateTime/);
});

test.run();
