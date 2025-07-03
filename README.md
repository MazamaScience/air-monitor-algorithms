# air-monitor-algorithms

Algorithms for processing hourly time series data, with an initial focus on
air quality monitoring applications.

This package supports the
[air-monitor](https://github.com/MazamaScience/air-monitor) ecosystem, which
works with air quality monitoring data archives hosted by the US Forest
Service.

> **Note:** All time series data are assumed to be on a regular hourly axis
> with no gaps. Missing values should be represented as `null`.
>
> **🚨 Important:** All timestamp inputs must be
> [Luxon](https://moment.github.io/luxon/) `DateTime` objects in the UTC timezone.
> All timestamp outputs are also returned as `DateTime` objects in UTC.

## Features

High-level analysis functions:

- `dailyStats(datetime, x, timezone)`
  Returns local-time daily statistics (min, max, mean, count) from hourly data.

- `diurnalStats(datetime, x, timezone, dayCount)`
  Returns local-time hourly averages from the most recent `dayCount` days.

- `pm_nowcast(pm)`
  Calculates EPA-style NowCast values from hourly PM2.5 or PM10 data.

- `trimDate(datetime, x, timezone)`
  Trims input to full local-time days (midnight to midnight).

Array utility functions:

- `arrayCount(x)` — Count of non-missing (`!= null`) values
- `arraySum(x)` — Sum of valid values
- `arrayMin(x)` — Minimum valid value
- `arrayMean(x)` — Mean of valid values
- `arrayMax(x)` — Maximum valid value

## Installation

To install the latest stable release from [npm](https://www.npmjs.com/package/air-monitor-algorithms):

```npm install air-monitor-algorithms```

To install the latest development version directly from GitHub:

```npm install github:MazamaScience/air-monitor-algorithms```

## Usage

This ES module can be used in modern JavaScript projects, including Svelte
and Vue apps. You must use Luxon `DateTime` objects in UTC as input timestamps.

```
import {
  dailyStats,
  pm_nowcast
} from "air-monitor-algorithms";
import { DateTime } from "luxon";

// Generate fake hourly data for 3 days
const datetime = [];
const x = [];

const start = DateTime.fromISO("2023-07-01T00:00:00Z"); // UTC
for (let i = 0; i < 72; i++) {
  datetime.push(start.plus({ hours: i }));       // UTC Luxon DateTime
  x.push(50 + Math.sin(i / 3) * 10);             // sinusoidal variation
}

// Calculate daily statistics in the 'America/Los_Angeles' timezone
const daily = dailyStats(datetime, x, "America/Los_Angeles");
console.log(daily.mean); // → [meanDay1, meanDay2, meanDay3]

// Apply NowCast to the hourly data
const nowcast = pm_nowcast(x);
console.log(nowcast.slice(-5)); // → last 5 hourly NowCast values
```

## Project Support

This project is supported by the [USFS AirFire](https://www.airfire.org) team.
