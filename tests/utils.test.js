import { test } from "uvu";
import * as assert from "uvu/assert";

import {
  arrayMin,
  arrayMax,
  arrayCount,
  arraySum,
  arrayMean,
  roundAndUseNull,
  useNull,
} from "../src/index.js";

test("roundAndUseNull works properly", () => {
  let x = [1, 1.1, 1.12, 1.123, 1.1234, NaN, undefined, null, 1.12345];
  let x_0 = [1, 1, 1, 1, 1, null, null, null, 1];
  let x_1 = [1, 1.1, 1.1, 1.1, 1.1, null, null, null, 1.1];
  let x_2 = [1, 1.1, 1.12, 1.12, 1.12, null, null, null, 1.12];
  let x_3 = [1, 1.1, 1.12, 1.123, 1.123, null, null, null, 1.123];
  let x_4 = [1, 1.1, 1.12, 1.123, 1.1234, null, null, null, 1.1235]; // rounds up

  assert.equal(roundAndUseNull(x), x_1); // defaults to digits = 1
  assert.equal(roundAndUseNull(x, 0), x_0);
  assert.equal(roundAndUseNull(x, 1), x_1);
  assert.equal(roundAndUseNull(x, 2), x_2);
  assert.equal(roundAndUseNull(x, 3), x_3);
  assert.equal(roundAndUseNull(x, 4), x_4);
});

test("useNull works properly", () => {
  let x = [1, 1.1, 1.12, 1.123, 1.1234, NaN, undefined, null, 1.12345];
  let x_null = [1, 1.1, 1.12, 1.123, 1.1234, null, null, null, 1.12345];
  assert.equal(useNull(x), x_null);
});

test("array math works properly", () => {
  let x = [16, 2, 8, NaN, undefined, null, 6];
  let x_null = [null, null, NaN, undefined, null];
  assert.is(arrayMin(x), 2);
  assert.is(arrayMin(x_null), null);
  assert.is(arrayMax(x), 16);
  assert.is(arrayMax(x_null), null);
  assert.is(arrayCount(x), 4);
  assert.is(arrayCount(x_null), 0);
  assert.is(arraySum(x), 32);
  assert.is(arraySum(x_null), null);
  assert.is(arrayMean(x), 8);
  assert.is(arrayMean(x_null), null);
});

test("array functions handle empty arrays", () => {
  const empty = [];
  assert.is(arrayMin(empty), null);
  assert.is(arrayMax(empty), null);
  assert.is(arrayCount(empty), 0);
  assert.is(arraySum(empty), null);
  assert.is(arrayMean(empty), null);
});

test("array functions handle all invalid values", () => {
  const bad = [NaN, undefined, null];
  assert.is(arrayMin(bad), null);
  assert.is(arrayMax(bad), null);
  assert.is(arrayCount(bad), 0);
  assert.is(arraySum(bad), null);
  assert.is(arrayMean(bad), null);
});

test("array functions handle single-value input", () => {
  const x = [4];
  assert.is(arrayMin(x), 4);
  assert.is(arrayMax(x), 4);
  assert.is(arrayCount(x), 1);
  assert.is(arraySum(x), 4);
  assert.is(arrayMean(x), 4);
});

test("roundAndUseNull handles edge rounding", () => {
  const x = [0.4449, 0.445, 0.4451];
  assert.equal(roundAndUseNull(x, 2), [0.44, 0.45, 0.45]);
});

test("roundAndUseNull handles large and negative numbers", () => {
  const x = [1234.567, -987.654];
  assert.equal(roundAndUseNull(x, 1), [1234.6, -987.7]);
});

test("useNull preserves already-valid numbers", () => {
  const x = [0, 5, -3.2];
  assert.equal(useNull(x), x);
});

test.run();
