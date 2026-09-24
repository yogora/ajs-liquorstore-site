/**
 * Live open/closed status for AJ's Beer, Wine & Spirits.
 *
 * Loaded on every page. Fills in:
 *   - #store-status  (the strip above the header)
 *   - any [data-hours-day] row on visit-us.html, adding an
 *     "is-today" class to the row matching the current day.
 *
 * Always checks the time in Carterville, IL (America/Chicago) via
 * Intl, never the visitor's own device time zone/locale, so someone
 * browsing from another time zone still sees the correct status.
 *
 * WEEKLY_HOURS and HOLIDAY_OVERRIDES are the only things that should
 * ever need editing here. Keep WEEKLY_HOURS in sync with the hours
 * hard-coded in every page's footer and on visit-us.html — this file
 * only computes a live status message from them, it does not build
 * or replace that hard-coded hours text (Google reads static HTML
 * more reliably, and it's what the LocalBusiness JSON-LD should
 * match).
 */
(function () {
  "use strict";

  // Regular weekly hours, in 24-hour "HH:MM" Central time.
  var WEEKLY_HOURS = {
    0: { opens: "11:00", closes: "21:00" }, // Sunday
    1: { opens: "09:00", closes: "22:00" }, // Monday
    2: { opens: "09:00", closes: "22:00" }, // Tuesday
    3: { opens: "09:00", closes: "22:00" }, // Wednesday
    4: { opens: "09:00", closes: "22:00" }, // Thursday
    5: { opens: "09:00", closes: "23:00" }, // Friday
    6: { opens: "09:00", closes: "23:00" }  // Saturday
  };

  // Holiday overrides, keyed by "YYYY-MM-DD" in Central time. Add an
  // entry before each holiday and update the Google Business Profile
  // at the same time — a site that says "Open now" when the store is
  // actually closed does more damage than showing no status at all.
  //
  // Examples:
  //   "2026-11-26": { closed: true, label: "Closed for Thanksgiving" },
  //   "2026-12-24": { opens: "09:00", closes: "17:00", label: "Closes early for Christmas Eve" },
  //   "2026-12-25": { closed: true, label: "Closed for Christmas" },
  //
  // Note: the "opens tomorrow" message always uses the regular
  // WEEKLY_HOURS for the next day — it does not check overrides for
  // that next date. If AJ's is closed on Christmas, the evening of
  // the 24th will still say "opens tomorrow" at the normal time
  // unless you also add a same-day note via this override's label.
  var HOLIDAY_OVERRIDES = {};

  var DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  function getChicagoNow() {
    var dateFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    var parts = {};
    dateFmt.formatToParts(new Date()).forEach(function (part) {
      parts[part.type] = part.value;
    });

    var weekdayFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      weekday: "long"
    });
    var weekdayIndex = DAY_NAMES.indexOf(weekdayFmt.format(new Date()).toLowerCase());

    // "24" from hour12:false at midnight comes back as "24" in some
    // engines instead of "00" — normalize it.
    var hour = parseInt(parts.hour, 10) % 24;

    return {
      dateStr: parts.year + "-" + parts.month + "-" + parts.day,
      minutes: hour * 60 + parseInt(parts.minute, 10),
      weekdayIndex: weekdayIndex
    };
  }

  function toMinutes(hhmm) {
    var bits = hhmm.split(":");
    return parseInt(bits[0], 10) * 60 + parseInt(bits[1], 10);
  }

  function formatTime(hhmm) {
    var total = toMinutes(hhmm);
    var hour24 = Math.floor(total / 60);
    var minute = total % 60;
    var period = hour24 >= 12 ? "PM" : "AM";
    var hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    var minuteStr = minute === 0 ? ":00" : ":" + (minute < 10 ? "0" : "") + minute;
    return hour12 + minuteStr + " " + period;
  }

  function getTodayHours(dateStr, weekdayIndex) {
    var override = HOLIDAY_OVERRIDES[dateStr];
    if (override) return override;
    return WEEKLY_HOURS[weekdayIndex];
  }

  function getStatusMessage() {
    var now = getChicagoNow();
    var today = getTodayHours(now.dateStr, now.weekdayIndex);

    if (today.closed) {
      return today.label || "Closed today";
    }

    var opens = toMinutes(today.opens);
    var closes = toMinutes(today.closes);

    if (now.minutes < opens) {
      return "Closed now — opens today at " + formatTime(today.opens);
    }
    if (now.minutes >= closes) {
      var tomorrow = WEEKLY_HOURS[(now.weekdayIndex + 1) % 7];
      return "Closed — opens tomorrow at " + formatTime(tomorrow.opens);
    }
    return "Open today until " + formatTime(today.closes);
  }

  function renderStatus() {
    var el = document.getElementById("store-status");
    if (!el) return;
    var message = getStatusMessage();
    var onVisitPage = /(^|\/)visit-us\.html$/.test(window.location.pathname);
    el.innerHTML = message + (onVisitPage ? "" : " — <a href=\"visit-us.html\">Visit Us</a>");
  }

  function highlightToday() {
    var rows = document.querySelectorAll("[data-hours-day]");
    if (!rows.length) return;
    var todayKey = DAY_NAMES[getChicagoNow().weekdayIndex];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute("data-hours-day") === todayKey) {
        rows[i].classList.add("is-today");
      }
    }
  }

  function init() {
    renderStatus();
    highlightToday();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
