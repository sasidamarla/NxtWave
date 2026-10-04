/**
 * GOOGLE SHEET BACKEND (paste into Extensions > Apps Script of a new Google Sheet)
 *
 * What it does: receives JSON from our /api/* endpoints and writes rows.
 *   type "register"   -> "Registrations" tab (skips duplicate emails, refuses when the seat cap is reached)
 *   type "submission" -> "Submissions" tab   (every attempt is logged; ONLY the first per email is
 *                         marked as the lucky-draw entry, so one person = one entry)
 *   type "count"      -> returns the number of registrations (for the seats-left bar)
 *
 * SETUP
 * 1. Create a Google Sheet. Open Extensions > Apps Script. Paste this file.
 * 2. Change SECRET below to a long random string. Use the SAME value as SHEETS_SECRET in Vercel.
 * 3. Deploy > New deployment > type "Web app".
 *      Execute as: Me      Who has access: Anyone
 * 4. Copy the Web app URL into SHEETS_WEBHOOK_URL (Vercel env var and local .env).
 * 5. Any time you edit this script: Deploy > Manage deployments > edit > New version.
 *
 * "Anyone" can reach the URL, which is why every request must carry the SECRET.
 */

const SECRET = "REPLACE_WITH_YOUR_SECRET";

const TABS = {
  Registrations: ["timestamp", "name", "email", "college", "year", "source"],
  Submissions: [
    "timestamp",
    "name",
    "email",
    "title",
    "link",
    "description",
    "overall",
    "functionality",
    "creativity",
    "aiUse",
    "completion",
    "source",
    "luckyDrawEntry", // 'yes' for the first submission of an email, 'no (repeat)' after that
  ],
};

function doPost(e) {
  const out = (obj) =>
    ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
      ContentService.MimeType.JSON,
    );

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return out({ ok: false, error: "bad json" });
  }
  if (body.secret !== SECRET) return out({ ok: false, error: "unauthorized" });

  // Lock so two people submitting at the same instant can't both pass the duplicate check.
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    if (body.type === "register") {
      const sheet = getTab("Registrations");
      const email = String(body.email).toLowerCase();
      const emails =
        sheet.getLastRow() > 1
          ? sheet
              .getRange(2, 3, sheet.getLastRow() - 1, 1)
              .getValues()
              .flat()
              .map((v) => String(v).toLowerCase())
          : [];
      if (emails.indexOf(email) !== -1)
        return out({ ok: true, duplicate: true });
      // Capacity check AFTER the duplicate check, inside the lock, so two people can't take the last seat.
      const taken = Math.max(0, sheet.getLastRow() - 1);
      if (body.maxSeats && taken >= Number(body.maxSeats))
        return out({ ok: true, full: true });
      sheet.appendRow([
        new Date(),
        safe(body.name),
        safe(email),
        safe(body.college),
        safe(body.year),
        safe(body.source),
      ]);
      return out({ ok: true, duplicate: false });
    }

    if (body.type === "submission") {
      const s = body.scores || {};
      const sub = getTab("Submissions");
      const email = String(body.email).toLowerCase();
      const seen =
        sub.getLastRow() > 1
          ? sub
              .getRange(2, 3, sub.getLastRow() - 1, 1)
              .getValues()
              .flat()
              .map((v) => String(v).toLowerCase())
          : [];
      const firstEntry = seen.indexOf(email) === -1;
      sub.appendRow([
        new Date(),
        safe(body.name),
        safe(email),
        safe(body.title),
        safe(body.link),
        safe(body.description),
        body.overall,
        s.functionality,
        s.creativity,
        s.aiUse,
        s.completion,
        safe(body.source),
        firstEntry ? "yes" : "no (repeat)",
      ]);
      return out({ ok: true, firstEntry: firstEntry });
    }

    if (body.type === "count") {
      const sheet = getTab("Registrations");
      return out({ ok: true, count: Math.max(0, sheet.getLastRow() - 1) });
    }

    return out({ ok: false, error: "unknown type" });
  } finally {
    lock.releaseLock();
  }
}

function getTab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(TABS[name]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Spreadsheet "formula injection" defence: a value starting with = + - @ would be
 * run as a formula when someone opens the Sheet. Prefix with an apostrophe to store it as text.
 */
function safe(value) {
  const s = value == null ? "" : String(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
