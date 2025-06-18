import { test } from "uvu";
import * as assert from "uvu/assert";

import moment from "moment-timezone";
import { diurnalStats } from "../src/index.js";

// Start of Valentine's Day in Greenwich
let start = moment.tz("2023-02-14 00:00:00", "UTC");
let datetime = [];
let x = [];

// Precisely 10 days worth of daily sinusoidal data
let day = 0;
for (var i = 0; i < 240; i++) {
  if (i % 24 === 0) day += 1;
  let plusOrMinus = day % 2 === 0 ? 1 : -1;
  datetime[i] = new Date(start + i * 3600 * 1000);
  let val = 10 + plusOrMinus * 5 * Math.sin((i * Math.PI) / 12);
  x[i] = Math.round(val * 10) / 10;
}

let hours = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  22, 23,
];

let counts_7 = [
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

let counts_4 = [
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
];

// UTC values
let min = [
  10, 8.7, 7.5, 6.5, 5.7, 5.2, 5, 5.2, 5.7, 6.5, 7.5, 8.7, 10, 8.7, 7.5, 6.5,
  5.7, 5.2, 5, 5.2, 5.7, 6.5, 7.5, 8.7,
];

let mean_odd = [
  10, 10.2, 10.4, 10.5, 10.6, 10.7, 10.7, 10.7, 10.6, 10.5, 10.4, 10.2, 10, 9.8,
  9.6, 9.5, 9.4, 9.3, 9.3, 9.3, 9.4, 9.5, 9.6, 9.8,
];

let mean_even = [
  10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
  10, 10, 10, 10, 10,
];

let max = [
  10, 11.3, 12.5, 13.5, 14.3, 14.8, 15, 14.8, 14.3, 13.5, 12.5, 11.3, 10, 11.3,
  12.5, 13.5, 14.3, 14.8, 15, 14.8, 14.3, 13.5, 12.5, 11.3,
];

// NOTE:  Chicago values are just UTC values offset by 6 hours
let min_Chicago = [
  5, 5.2, 5.7, 6.5, 7.5, 8.7, 10, 8.7, 7.5, 6.5, 5.7, 5.2, 5, 5.2, 5.7, 6.5,
  7.5, 8.7, 10, 8.7, 7.5, 6.5, 5.7, 5.2,
];

let mean_Chicago = [
  9.3, 9.3, 9.4, 9.5, 9.6, 9.8, 10, 10.2, 10.4, 10.5, 10.6, 10.7, 10.7, 10.7,
  10.6, 10.5, 10.4, 10.2, 10, 10.2, 10.4, 10.5, 10.6, 10.7,
];

let max_Chicago = [
  15, 14.8, 14.3, 13.5, 12.5, 11.3, 10, 11.3, 12.5, 13.5, 14.3, 14.8, 15, 14.8,
  14.3, 13.5, 12.5, 11.3, 10, 11.3, 12.5, 13.5, 14.3, 14.8,
];

test("diurnal averages work for 'UTC'", () => {
  let timezone = "UTC";
  let diurnal = diurnalStats(datetime, x, timezone);
  assert.equal(diurnal.hour, hours);
  assert.equal(diurnal.count, counts_7);
  assert.equal(diurnal.min, min);
  assert.equal(diurnal.mean, mean_odd);
  assert.equal(diurnal.max, max);
});

test("diurnal averages work for 'America/Chicago'", () => {
  let timezone = "America/Chicago";
  let diurnal = diurnalStats(datetime, x, timezone);
  assert.equal(diurnal.hour, hours);
  assert.equal(diurnal.count, counts_7);
  assert.equal(diurnal.min, min_Chicago);
  assert.equal(diurnal.mean, mean_Chicago);
  assert.equal(diurnal.max, max_Chicago);
});

test("diurnal averages work for 4 days", () => {
  let timezone = "UTC";
  let diurnal = diurnalStats(datetime, x, timezone, 4);
  assert.equal(diurnal.hour, hours);
  assert.equal(diurnal.count, counts_4);
  assert.equal(diurnal.min, min);
  assert.equal(diurnal.mean, mean_even);
  assert.equal(diurnal.max, max);
});

test("diurnal averages work with missing values", () => {
  let timezone = "UTC";
  [239, 238, 237, 215, 214, 191].map((o) => (x[o] = null));
  let diurnal = diurnalStats(datetime, x, timezone, 3);

  let myMin = [
    10,
    8.7,
    7.5,
    6.5,
    5.7,
    5.2,
    5,
    5.2,
    5.7,
    6.5,
    7.5,
    8.7,
    10,
    8.7,
    7.5,
    6.5,
    5.7,
    5.2,
    5,
    5.2,
    5.7,
    6.5,
    7.5,
    null,
  ];

  let myMean = [
    10,
    10.4,
    10.8,
    11.2,
    11.4,
    11.6,
    11.7,
    11.6,
    11.4,
    11.2,
    10.8,
    10.4,
    10,
    9.6,
    9.2,
    8.8,
    8.6,
    8.4,
    8.3,
    8.4,
    8.6,
    10,
    7.5,
    null,
  ];

  let myMax = [
    10,
    11.3,
    12.5,
    13.5,
    14.3,
    14.8,
    15,
    14.8,
    14.3,
    13.5,
    12.5,
    11.3,
    10,
    11.3,
    12.5,
    13.5,
    14.3,
    14.8,
    15,
    14.8,
    14.3,
    13.5,
    7.5,
    null,
  ];

  assert.equal(diurnal.hour, hours);
  assert.equal(
    diurnal.count,
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0]
  );
  assert.equal(diurnal.min, myMin);
  assert.equal(diurnal.mean, myMean);
  assert.equal(diurnal.max, myMax);
});

test("returns empty result when given no data", () => {
  const result = diurnalStats([], [], "UTC");
  assert.equal(result.hour, []);
  assert.equal(result.count, []);
  assert.equal(result.min, []);
  assert.equal(result.mean, []);
  assert.equal(result.max, []);
});

test("returns empty result for partial day of data", () => {
  const dt = datetime.slice(0, 12);
  const y = x.slice(0, 12);
  const result = diurnalStats(dt, y, "UTC");
  assert.equal(result.hour, []);
  assert.equal(result.count, []);
});

test("mean values are rounded to 1 decimal place", () => {
  const result = diurnalStats(datetime, x, "UTC");
  result.mean.forEach((v) => {
    if (v !== null) {
      assert.match(v.toFixed(1), /^[0-9]+\.[0-9]$/);
    }
  });
});

test("min and max differ when input is not flat", () => {
  const flat = Array(24 * 7).fill(10);
  const flatDatetime = datetime.slice(0, flat.length);
  const result = diurnalStats(flatDatetime, flat, "UTC");
  result.min.forEach((minVal, i) => {
    assert.is(minVal, 10);
    assert.is(result.max[i], 10);
  });

  const notFlat = flat.slice();
  notFlat[23] = 20; // spike at end of day 1
  const result2 = diurnalStats(flatDatetime, notFlat, "UTC");
  assert.ok(result2.max[23] > result2.min[23]);
});

// TODO:  Create a test showing that min and max can be different

// ----- Run all tests ---------------------------------------------------------

test.run();

// ----- Notes -----------------------------------------------------------------

// Manual testing for "America/Chicago"

// x.slice(0,24)
// // (24) [10, 11.3, 12.5, 13.5, 14.3, 14.8, 15, 14.8, 14.3, 13.5, 12.5, 11.3, 10, 8.7, 7.5, 6.5, 5.7, 5.2, 5, 5.2, 5.7, 6.5, 7.5, 8.7]
// x.slice(6,30)
// // (24) [15, 14.8, 14.3, 13.5, 12.5, 11.3, 10, 8.7, 7.5, 6.5, 5.7, 5.2, 5, 5.2, 5.7, 6.5, 7.5, 8.7, 10, 11.3, 12.5, 13.5, 14.3, 14.8]
