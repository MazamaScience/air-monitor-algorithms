import { pm_nowcast } from "../src/index.js";
import { trimDate } from "../src/index.js";
import { dailyStats } from "../src/index.js";
import { diurnalStats } from "../src/index.js";

import { DateTime } from "luxon";

let datetime = [];
let x = [];
let timezone = "America/Los_Angeles";

let now = DateTime.utc().startOf("hour");

for (var i = 0; i < 240; i++) {
  // Create plain UTC Date objects
  datetime[i] = new Date(now.toMillis() - (240 - i) * 3600 * 1000);
  let val = 10 + 5 * Math.sin((i * Math.PI) / 12) + Math.random() * 6 - 3;
  x[i] = Math.round(val * 10) / 10;
}

let trimmed = trimDate(datetime, x, timezone);

let nowcast = pm_nowcast(x); // looks good

let daily = dailyStats(datetime, x, timezone);
console.table(daily)

let diurnal = diurnalStats(datetime, x, timezone);

let z = 1;

// ----- PLAY AREA -------------------------------------------------------------

let zzz = 1;
