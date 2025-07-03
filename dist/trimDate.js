"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.trimDate = trimDate;
var _luxon = require("luxon");
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * Trim a time series to full local calendar days.
 *
 * Discards any partial days at the beginning or end of the array. Uses the local
 * time zone to determine day boundaries, but always returns timestamps in UTC.
 *
 * @param {Array.<DateTime>} datetime - Array of Luxon DateTime objects (in UTC).
 * @param {Array.<number>} x - Array of measurements (same length as datetime).
 * @param {string} timezone - IANA/Olson timezone (e.g. "America/Los_Angeles").
 * @returns {object} - Object with `datetime` and `x` arrays trimmed to full days.
 */
function trimDate(datetime, x, timezone) {
  if (!Array.isArray(datetime) || !Array.isArray(x) || datetime.length !== x.length) {
    throw new Error("datetime and x must be arrays of equal length.");
  }
  if (typeof timezone !== "string") {
    throw new Error("timezone must be a string.");
  }
  var _iterator = _createForOfIteratorHelper(datetime),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var dt = _step.value;
      if (!_luxon.DateTime.isDateTime(dt)) {
        throw new Error("All entries in datetime must be Luxon DateTime objects.");
      }
      if (dt.zoneName !== "UTC") {
        throw new Error("All datetime values must be in the UTC time zone.");
      }
    }

    // Convert to local hours
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var localHours = datetime.map(function (dt) {
    return dt.setZone(timezone).hour;
  });

  // Determine how many entries to trim from start
  var start = localHours[0] === 0 ? 0 : 24 - localHours[0];

  // Determine how many entries to keep up to the last full hour of a full day
  var lastHour = localHours[localHours.length - 1];
  var end = lastHour === 23 ? localHours.length : localHours.length - (lastHour + 1);
  if (end <= start) {
    return {
      datetime: [],
      x: []
    };
  }
  return {
    datetime: datetime.slice(start, end),
    x: x.slice(start, end)
  };
}