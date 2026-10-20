/*
  CLOSE EVERY OPEN BUSINESS DAY

  Run it once a day, e.g. after the last sale of the day:

    npm run close-day

  It closes the open business day of every business, including days that
  were skipped because nobody opened the app. Days that were never
  finished are reported and left open, because their figures would
  otherwise be invented.

  Add --dry-run to see what would happen without changing anything.
*/

import "dotenv/config";
import connectDB from "../config/db.js";
import DailyRecord from "../models/DailyRecord.js";
import Business from "../models/Business.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dryRun = process.argv.includes("--dry-run");

function startOfToday() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString();
}

// Whole days since the business day was opened.
function ageInDays(date) {
  const from = new Date(date);

  from.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((Date.now() - from.getTime()) / MS_PER_DAY),
  );
}

// Beers whose evening stock was never recorded.
function missingEveningStock(day) {
  return day.stock.filter((item) => item.evening === null);
}

const closeOpenDays = async () => {
  try {
    await connectDB();

    const openDays = await DailyRecord.find({
      closed: false,
    }).sort({ date: 1 });

    if (openDays.length === 0) {
      console.log("No open business days. Nothing to close.");
      process.exit(0);
    }

    const businesses = await Business.find().select("name").lean();

    const businessNames = Object.fromEntries(
      businesses.map((business) => [
        String(business._id),
        business.name,
      ]),
    );

    console.log(
      `${dryRun ? "DRY RUN - " : ""}open business days found: ${openDays.length}\n`,
    );

    const skipped = [];

    for (const day of openDays) {
      const businessName =
        businessNames[String(day.businessId)] ?? "unknown business";

      const age = ageInDays(day.date);
      const stale = age > 0;

      console.log(
        `${formatDate(day.date)}  ${businessName}  (${age} day(s) old)`,
      );

      if (stale) {
        console.log(
          `  stale: this day was never closed before the next day started`,
        );
      }

      // Evening stock must be recorded, it drives sold and expected sales.
      const missing = missingEveningStock(day);

      if (day.totals.expectedSales === null || missing.length > 0) {
        console.log(
          `  CANNOT CLOSE: evening stock was never recorded.`,
        );

        if (missing.length > 0) {
          for (const item of missing) {
            console.log(`    - ${item.name}: evening stock missing`);
          }
        } else {
          console.log(
            `    open the Daily Record page and record evening stock first`,
          );
        }

        skipped.push(`${businessName} (${formatDate(day.date)})`);
        console.log("");
        continue;
      }

      // Actual cash must be recorded, it decides the day status.
      if (day.payments.actualCash === null) {
        console.log(
          `  CANNOT CLOSE: actual cash was never recorded.`,
        );
        console.log(
          `    open the Daily Record page and record actual cash first`,
        );

        skipped.push(`${businessName} (${formatDate(day.date)})`);
        console.log("");
        continue;
      }

      // Same balance calculation as POST /api/days/close.
      if (day.payments.mobileMoney === null) {
        day.payments.mobileMoney = 0;

        day.totals.expectedCash = day.totals.expectedSales;
      }

      const difference =
        day.payments.actualCash - day.totals.expectedCash;

      let status;

      if (difference === 0) {
        status = "balanced";
      } else if (difference < 0) {
        status = "shortage";
      } else {
        status = "surplus";
      }

      console.log(`  sold: ${day.totals.sold}`);
      console.log(`  expected sales: ${day.totals.expectedSales}`);
      console.log(`  mobile money: ${day.payments.mobileMoney}`);
      console.log(`  actual cash: ${day.payments.actualCash}`);
      console.log(`  difference: ${difference} (${status})`);

      if (dryRun) {
        console.log("  would close this day (dry run, nothing saved)");
      } else {
        day.difference = difference;
        day.status = status;
        day.closed = true;
        day.closedBy = null;

        await day.save();

        console.log("  closed");
      }

      console.log("");
    }

    if (skipped.length > 0) {
      console.log(
        `${skipped.length} business day(s) left open because figures are missing:`,
      );

      for (const item of skipped) {
        console.log(`  - ${item}`);
      }

      process.exit(1);
    }

    if (dryRun) {
      console.log("Dry run finished. No data was changed.");
    } else {
      console.log("All open business days are now closed.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to close open business days:", error);
    process.exit(1);
  }
};

closeOpenDays();
