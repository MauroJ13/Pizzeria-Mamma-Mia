// ---------- Nur vegetarisch ----------
const vegToggle = document.getElementById("veg-only");

vegToggle.addEventListener("change", () => {
  document.body.classList.toggle("veg-only", vegToggle.checked);
});

// ---------- Aktive Kategorie beim Scrollen markieren ----------
const tabs = document.querySelectorAll(".menu-tab");
const sections = document.querySelectorAll(".menu-section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      tabs.forEach((tab) => {
        tab.classList.toggle(
          "is-active",
          tab.getAttribute("href") === "#" + entry.target.id,
        );
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);

sections.forEach((section) => observer.observe(section));
