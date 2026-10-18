// Öffnungszeiten (Stunden, 25 = 01.00 Uhr in der Nacht)
// 0 = Sonntag, 1 = Montag, ...
const OPENING_HOURS = {
  0: [11, 21],
  1: null, // Ruhetag
  2: [11, 23],
  3: [11, 23],
  4: [11, 22],
  5: [11, 25],
  6: [11, 23],
};

const DAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

function formatHour(hour) {
  return String(hour % 24).padStart(2, "0") + ".00";
}

// ---------- Geöffnet / Geschlossen ----------
function updateOpenStatus() {
  const statusEl = document.querySelector(".open-status");
  if (!statusEl) return;

  const now = new Date();
  const today = now.getDay();
  const yesterday = (today + 6) % 7;
  const hourNow = now.getHours() + now.getMinutes() / 60;

  // heutigen Tag in der Tabelle markieren
  document.querySelectorAll(".hours-entry").forEach((entry) => {
    entry.classList.toggle("is-today", Number(entry.dataset.day) === today);
  });

  // nach Mitternacht: hat gestern noch offen?
  const late = OPENING_HOURS[yesterday];
  if (late && late[1] > 24 && hourNow < late[1] - 24) {
    statusEl.innerHTML = `<span class="dot dot-open"></span>Jetzt geöffnet · bis ${formatHour(late[1])} Uhr`;
    return;
  }

  const hours = OPENING_HOURS[today];

  if (hours && hourNow >= hours[0] && hourNow < hours[1]) {
    statusEl.innerHTML = `<span class="dot dot-open"></span>Jetzt geöffnet · bis ${formatHour(hours[1])} Uhr`;
    return;
  }

  if (hours && hourNow < hours[0]) {
    statusEl.innerHTML = `<span class="dot"></span>Geschlossen · öffnet heute um ${formatHour(hours[0])} Uhr`;
    return;
  }

  // nächsten offenen Tag suchen
  for (let i = 1; i <= 7; i++) {
    const day = (today + i) % 7;
    if (OPENING_HOURS[day]) {
      const label = i === 1 ? "morgen" : `am ${DAY_NAMES[day]}`;
      statusEl.innerHTML = `<span class="dot"></span>Geschlossen · öffnet ${label} um ${formatHour(OPENING_HOURS[day][0])} Uhr`;
      return;
    }
  }
}

updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

// ---------- Reservierung ----------
const form = document.querySelector(".reservation-form");

if (form) {
  const hint = form.querySelector(".form-hint");
  const dateInput = form.querySelector('[name="datum"]');

  // frühestes Datum = heute
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().split("T")[0];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    hint.classList.remove("is-error");

    const data = new FormData(form);
    const date = new Date(data.get("datum") + "T00:00");
    const [h, m] = data.get("zeit").split(":").map(Number);
    const time = h + m / 60;
    const hours = OPENING_HOURS[date.getDay()];

    if (!hours) {
      hint.textContent = "Montag ist Ruhetag – bitte wählt einen anderen Tag.";
      hint.classList.add("is-error");
      return;
    }

    // letzte Reservierung eine Stunde vor Schluss
    if (time < hours[0] || time > hours[1] - 1) {
      hint.textContent = `Am ${DAY_NAMES[date.getDay()]} können wir zwischen ${formatHour(hours[0])} und ${formatHour(hours[1] - 1)} Uhr reservieren.`;
      hint.classList.add("is-error");
      return;
    }

    const dateText = date.toLocaleDateString("de-CH", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const body = [
      "Hallo Mamma Mia Team,",
      "",
      `ich möchte gerne einen Tisch reservieren:`,
      "",
      `Name: ${data.get("name")}`,
      `Personen: ${data.get("personen")}`,
      `Datum: ${dateText}`,
      `Uhrzeit: ${data.get("zeit")} Uhr`,
      data.get("nachricht") ? `\nNachricht: ${data.get("nachricht")}` : "",
      "",
      "Vielen Dank!",
    ].join("\n");

    const subject = `Reservierung für ${data.get("personen")} Personen am ${dateText}`;

    window.location.href =
      "mailto:mauro.jakic@hotmail.com" +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    hint.textContent = "Danke! Euer E-Mail-Programm sollte sich jetzt öffnen.";
  });
}

// ---------- Nach oben ----------
const toTop = document.querySelector(".to-top");

function onScroll() {
  const scrolled = window.scrollY > 600;
  toTop?.classList.toggle("is-visible", scrolled);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Jahr im Footer
const yearEl = document.querySelector(".year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
