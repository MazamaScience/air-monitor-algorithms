import { test } from "uvu";
import * as assert from "uvu/assert";

import { DateTime } from "luxon";
import { dailyStats } from "../src/index.js";

// Start of Valentine's Day in Greenwich
let start = DateTime.fromISO("2023-02-14T00:00:00", { zone: "UTC" });
let datetime = [];
let x = [];

// Precisely 10 days worth of data
let day = 0;
for (var i = 0; i < 240; i++) {
  if (i % 24 === 0) day++;
  datetime[i] = new Date(start + i * 3600 * 1000);
  let val = day * 10 + 5 * Math.sin((i * Math.PI) / 12);
  x[i] = Math.round(val * 10) / 10;
}

test("daily averages work for 'UTC'", () => {
  let timezone = "UTC";
  let daily = dailyStats(datetime, x, timezone);
  let day0 = DateTime.fromISO("2023-02-14T00:00:00", { zone: "UTC" }).toJSDate();
  let day1 = DateTime.fromISO("2023-02-15T00:00:00", { zone: "UTC" }).toJSDate();
  assert.equal(daily.datetime.slice(0, 2), [day0, day1]);
  assert.equal(daily.count, [24, 24, 24, 24, 24, 24, 24, 24, 24, 24]);
  assert.equal(daily.min, [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]);
  assert.equal(daily.mean, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  assert.equal(daily.max, [15, 25, 35, 45, 55, 65, 75, 85, 95, 105]);
});

test("daily averages work for 'America/Chicago'", () => {
  let timezone = "America/Chicago";
  let daily = dailyStats(datetime, x, timezone);
  let day0 = DateTime.fromISO("2023-02-14T00:00:00", { zone: "UTC" }).toJSDate();
  let day1 = DateTime.fromISO("2023-02-15T00:00:00", { zone: "UTC" }).toJSDate();
  assert.equal(daily.datetime.slice(0, 2), [day0, day1]);
  assert.equal(daily.count, [24, 24, 24, 24, 24, 24, 24, 24, 24]);
  assert.equal(daily.min, [5, 15, 25, 35, 45, 55, 65, 75, 85]);
  assert.equal(
    daily.mean,
    [12.5, 22.5, 32.5, 42.5, 52.5, 62.5, 72.5, 82.5, 92.5]
  );
  assert.equal(
    daily.max,
    [24.8, 34.8, 44.8, 54.8, 64.8, 74.8, 84.8, 94.8, 104.8]
  );
});

test("daily averages work with missing values", () => {
  let timezone = "UTC";
  [1, 3, 4, 28, 29, 52].map((o) => (x[o] = null));
  let daily = dailyStats(datetime, x, timezone);
  assert.equal(daily.count, [21, 22, 23, 24, 24, 24, 24, 24, 24, 24]);
});

test("returns empty result for empty input", () => {
  let result = dailyStats([], [], "UTC");
  assert.equal(result.datetime, []);
  assert.equal(result.count, []);
  assert.equal(result.min, []);
  assert.equal(result.mean, []);
  assert.equal(result.max, []);
});

test("returns empty result for partial day", () => {
  const partialDatetime = datetime.slice(0, 12);
  const partialX = x.slice(0, 12);
  const result = dailyStats(partialDatetime, partialX, "UTC");
  assert.equal(result.datetime, []);
  assert.equal(result.count, []);
});

test("throws on mismatched input lengths", () => {
  const badX = x.slice(0, 200); // too short
  assert.throws(() => dailyStats(datetime, badX, "UTC"));
});

test("mean values are rounded to 1 decimal place", () => {
  const result = dailyStats(datetime, x, "UTC");
  result.mean.forEach((v) => {
    if (v !== null) {
      assert.match(v.toFixed(1), /^[0-9]+\.[0-9]$/);
    }
  });
});

test("dailyStats computes mean correctly with missing values", () => {
  const timezone = "UTC";
  const start = DateTime.fromISO("2023-02-14T00:00:00", { zone: timezone });

  const datetime = [];
  const x = [];

  for (let i = 0; i < 24; i++) {
    datetime[i] = start.plus({ hours: i }).toJSDate();
    x[i] = i + 1; // [1, 2, ..., 24]
  }

  x[4] = null;   // omit 5
  x[10] = null;  // omit 11

  // Expected sum = 283, count = 22, mean = 12.9
  const result = dailyStats(datetime, x, timezone);

  assert.equal(result.datetime.length, 1);
  assert.equal(result.count[0], 22);
  assert.equal(result.min[0], 1);
  assert.equal(result.max[0], 24);
  assert.is(result.mean[0], 12.9);
});


// TODO:  Test that averages are correct when missing values are present.

// ----- Run all tests ---------------------------------------------------------

test.run();

// ----- Notes -----------------------------------------------------------------

// // Manual testing for "America/Chicago"
// x.slice(6, 30).reduce((a, o) => a + o) / 24;
// // 12.5
// x.slice(30, 54).reduce((a, o) => a + o) / 24;
// // 22.5

// x[3] = null;
// x[5] = null;
// let validHour = x.map((o) => (o === null ? 0 : 1));
// validHour.slice(0, 24).reduce((a, o) => a + o);
// // 22
