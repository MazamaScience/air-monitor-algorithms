import { test } from "uvu";
import * as assert from "uvu/assert";

import { DateTime } from "luxon";
import { trimDate } from "../src/index.js";

let datetime = [];
let x = [];

// Start of Valentine's Day in UTC
let start = new Date(Date.UTC(2023, 1, 14, 0, 0, 0)); // Months are 0-based: 1 = February

// ----- Test trimming in different timezones ----------------------------------

// Precisely 10 days worth of hourly data (240 hours)
for (let i = 0; i < 240; i++) {
  datetime[i] = new Date(start.getTime() + i * 3600 * 1000); // Add i hours
  let val = 10 + 5 * Math.sin((i * Math.PI) / 12) + Math.random() * 6 - 3;
  x[i] = Math.round(val * 10) / 10;
}

test("trimming Date objects works for 'UTC'", () => {
  let timezone = "UTC";
  let trimmed = trimDate(datetime, x, timezone);
  let tz_start = DateTime.fromJSDate(trimmed.datetime[0], { zone: timezone});
  let tz_end = DateTime.fromJSDate(trimmed.datetime[239], { zone: timezone});
  assert.is(trimmed.datetime.length, 240);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);
  // UTC is 8 hours ahead of "America/Los_Angeles" during the winter
  assert.is(trimmed.datetime[0].valueOf(), datetime[0].valueOf());
  assert.is(trimmed.x[0], x[0]);
});

test("trimming Date objects works for 'America/Los_Angeles'", () => {
  let timezone = "America/Los_Angeles";
  let trimmed = trimDate(datetime, x, timezone);
  let tz_start = DateTime.fromJSDate(trimmed.datetime[0], { zone: timezone});
  let tz_end = DateTime.fromJSDate(trimmed.datetime[215], { zone: timezone});
  assert.is(trimmed.datetime.length, 216);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);
  // UTC is 8 hours ahead of "America/Los_Angeles" during the winter
  assert.is(trimmed.datetime[0].valueOf(), datetime[8].valueOf());
  assert.is(trimmed.x[0], x[8]);
});

test("trimming Date objects works for 'America/New_York'", () => {
  let timezone = "America/New_York";
  let trimmed = trimDate(datetime, x, timezone);
  let tz_start = DateTime.fromJSDate(trimmed.datetime[0], { zone: timezone});
  let tz_end = DateTime.fromJSDate(trimmed.datetime[215], { zone: timezone});
  assert.is(trimmed.datetime.length, 216);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);
  // UTC is 5 hours ahead of "America/New_York" during the winter
  assert.is(trimmed.datetime[0].valueOf(), datetime[5].valueOf());
  assert.is(trimmed.x[0], x[5]);
});

// ----- Test passing in Luxon DateTime objects --------------------------------

// Precisely 10 days worth of data
for (let i = 0; i < 240; i++) {
  datetime[i] = DateTime.fromMillis(start.getTime() + i * 3600 * 1000, { zone: "UTC" })
  let val = 10 + 5 * Math.sin((i * Math.PI) / 12) + Math.random() * 6 - 3;
  x[i] = Math.round(val * 10) / 10;
}

test("trimming moment.tz objects works for 'America/Los_Angeles'", () => {
  let timezone = "America/Los_Angeles";
  let trimmed = trimDate(datetime, x, timezone);
  let tz_start = DateTime.fromJSDate(trimmed.datetime[0], { zone: timezone});
  let tz_end = DateTime.fromJSDate(trimmed.datetime[215], { zone: timezone});
  assert.is(trimmed.datetime.length, 216);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);
  // UTC is 8 hours ahead of "America/Los_Angeles" during the winter
  assert.is(trimmed.datetime[0].valueOf(), datetime[8].valueOf());
  assert.is(trimmed.x[0], x[8]);
});

test("trimming Date objects works for 'America/New_York'", () => {
  let timezone = "America/New_York";
  let trimmed = trimDate(datetime, x, timezone);
  let tz_start = DateTime.fromJSDate(trimmed.datetime[0], { zone: timezone});
  let tz_end = DateTime.fromJSDate(trimmed.datetime[215], { zone: timezone});
  assert.is(trimmed.datetime.length, 216);
  assert.is(tz_start.hour, 0);
  assert.is(tz_end.hour, 23);
  // UTC is 5 hours ahead of "America/New_York" during the winter
  assert.is(trimmed.datetime[0].valueOf(), datetime[5].valueOf());
  assert.is(trimmed.x[0], x[5]);
});

test("trimming ignores partial trailing days", () => {
  let partialDatetime = datetime.slice(0, 238); // 238 < 10 full days
  let partialX = x.slice(0, 238);
  let timezone = "UTC";
  let trimmed = trimDate(partialDatetime, partialX, timezone);
  assert.is(trimmed.datetime.length, 216); // 9 full days
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
    const ts = trimmed.datetime[i].valueOf();
    const originalIndex = datetime.findIndex((d) => d.valueOf() === ts);
    assert.is(trimmed.x[i], x[originalIndex]);
  }
});

test("throws on mismatched input lengths", () => {
  const badX = x.slice(0, 100); // shorter than datetime
  assert.throws(() => trimDate(datetime, badX, "UTC"));
});

// ----- Run all tests ---------------------------------------------------------

test.run();
