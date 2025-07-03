import { test } from "uvu";
import * as assert from "uvu/assert";

import { DateTime } from "luxon";
import { dailyStats } from "../src/index.js";

// Start of Valentine's Day in UTC
const start = DateTime.fromISO("2023-02-14T00:00:00", { zone: "UTC" });

let datetime = [];
let x = [];

// Precisely 10 days worth of data (240 hourly values)
let day = 0;
for (let i = 0; i < 240; i++) {
  if (i % 24 === 0) day++;
  datetime[i] = start.plus({ hours: i }); // Luxon DateTime in UTC
  const val = day * 10 + 5 * Math.sin((i * Math.PI) / 12);
  x[i] = Math.round(val * 10) / 10;
}

test("daily averages work for 'UTC'", () => {
  const timezone = "UTC";
  const daily = dailyStats(datetime, x, timezone);

  const day0 = DateTime.fromISO("2023-02-14T00:00:00", { zone: "UTC" });
  const day1 = DateTime.fromISO("2023-02-15T00:00:00", { zone: "UTC" });

  assert.equal(
    daily.datetime.slice(0, 2).map((dt) => dt.toISO()),
    [day0.toISO(), day1.toISO()]
  );

  assert.equal(daily.count, Array(10).fill(24));
  assert.equal(daily.min, [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]);
  assert.equal(daily.mean, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  assert.equal(daily.max, [15, 25, 35, 45, 55, 65, 75, 85, 95, 105]);
});

test("daily averages work for 'America/Chicago'", () => {
  const timezone = "America/Chicago";
  const daily = dailyStats(datetime, x, timezone);

  const day0 = DateTime.fromISO("2023-02-14T00:00:00", { zone: timezone });
  const day1 = DateTime.fromISO("2023-02-15T00:00:00", { zone: timezone });

  assert.equal(
    daily.datetime.slice(0, 2).map((dt) => dt.setZone(timezone).toISO()),
    [day0.toISO(), day1.toISO()]
  );

  assert.equal(daily.count.length, 9);
  assert.equal(daily.count, Array(9).fill(24));
  assert.equal(daily.min, [5, 15, 25, 35, 45, 55, 65, 75, 85]);
  assert.equal(daily.mean, [12.5, 22.5, 32.5, 42.5, 52.5, 62.5, 72.5, 82.5, 92.5]);
  assert.equal(daily.max, [24.8, 34.8, 44.8, 54.8, 64.8, 74.8, 84.8, 94.8, 104.8]);
});

test("daily averages work with missing values", () => {
  const timezone = "UTC";
  const xCopy = [...x];
  [1, 3, 4, 28, 29, 52].forEach((i) => (xCopy[i] = null));
  const daily = dailyStats(datetime, xCopy, timezone);

  assert.equal(daily.count, [21, 22, 23, 24, 24, 24, 24, 24, 24, 24]);
});

test("returns empty result for empty input", () => {
  const result = dailyStats([], [], "UTC");
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
  const badX = x.slice(0, 200);
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
    datetime[i] = start.plus({ hours: i }); // UTC
    x[i] = i + 1;
  }

  x[4] = null;
  x[10] = null;

  const result = dailyStats(datetime, x, timezone);

  assert.equal(result.datetime.length, 1);
  assert.equal(result.count[0], 22);
  assert.equal(result.min[0], 1);
  assert.equal(result.max[0], 24);
  assert.is(result.mean[0], 12.9);
});

test.run();
