import { pm_nowcast } from "../src/index.js";
import { trimDate } from "../src/index.js";
import { dailyStats } from "../src/index.js";
import { diurnalStats } from "../src/index.js";

import moment from "moment-timezone";

let datetime = [];
let x = [];
let timezone = "America/Los_Angeles";

let now = moment.tz("UTC").startOf("hour");

for (var i = 0; i < 240; i++) {
  datetime[i] = new Date(now - (240 - i) * 3600 * 1000);
  let val = 10 + 5 * Math.sin((i * Math.PI) / 12) + Math.random() * 6 - 3;
  x[i] = Math.round(val * 10) / 10;
}

let nowcast = pm_nowcast(x); // looks good

let trimmed = trimDate(datetime, x, timezone);

let daily = dailyStats(datetime, x, timezone);

let diurnal = diurnalStats(datetime, x, timezone);

let z = 1;

// ----- PLAY AREA -------------------------------------------------------------

let zzz = 1;
