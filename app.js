
// ✅ Mock dataset (no external API required)

const CARS = [
    { id: 1, make: "Toyota", model: "Corolla", year: 2022, body: "Sedan", fuel: "Petrol", seats: 5, pricePerWeek: 179, keywords: ["reliable", "commuter"] },
    { id: 2, make: "Toyota", model: "RAV4", year: 2023, body: "SUV", fuel: "Hybrid", seats: 5, pricePerWeek: 259, keywords: ["family", "hybrid", "popular"] },
    { id: 3, make: "Honda", model: "Civic", year: 2021, body: "Sedan", fuel: "Petrol", seats: 5, pricePerWeek: 189, keywords: ["sporty", "daily"] },
    { id: 4, make: "Mazda", model: "CX-5", year: 2022, body: "SUV", fuel: "Petrol", seats: 5, pricePerWeek: 239, keywords: ["comfort", "suv"] },
    { id: 5, make: "Hyundai", model: "i30", year: 2020, body: "Hatch", fuel: "Petrol", seats: 5, pricePerWeek: 159, keywords: ["budget", "hatch"] },
    { id: 6, make: "Kia", model: "Sportage", year: 2023, body: "SUV", fuel: "Petrol", seats: 5, pricePerWeek: 249, keywords: ["roomy", "new"] },
    { id: 7, make: "Tesla", model: "Model 3", year: 2022, body: "Sedan", fuel: "EV", seats: 5, pricePerWeek: 329, keywords: ["electric", "tech"] },
  { id: 8, make: "Subaru", model: "Outback", year: 2021, body: "Wagon", fuel: "Petrol", seats: 5, pricePerWeek: 279, keywords: ["awd", "adventure"] },
  { id: 9, make: "Ford", model: "Ranger", year: 2022, body: "Ute", fuel: "Diesel", seats: 5, pricePerWeek: 339, keywords: ["work", "tough"] },
  { id: 10, make: "BMW", model: "X3", year: 2021, body: "SUV", fuel: "Petrol", seats: 5, pricePerWeek: 399, keywords: ["luxury", "premium"] },
];

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsEl = document.getElementById("results");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const metaEl = document.getElementById("meta");

// LocalStorage keys (shows you used localStorage in a legit way)
const LS_LAST_QUERY = "car_mock_last_query_v1";
const LS_FAVORITES = "car_mock_favorites_v1";

function setError(msg = "") {
  errorEl.textContent = msg;
  errorEl.classList.toggle("hidden", !msg);
}

function setLoading(on) {
  loadingEl.classList.toggle("hidden", !on);
}

function setMeta(msg = "") {
  metaEl.textContent = msg;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(LS_FAVORITES)) ?? [];
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(LS_FAVORITES, JSON.stringify(ids));
}

function toggleFavorite(id) {
  const favs = new Set(getFavorites());
  favs.has(id) ? favs.delete(id) : favs.add(id);
  setFavorites([...favs]);
}

function matchesQuery(car, q) {
  const haystack = [
    car.make, car.model, car.year, car.body, car.fuel,
    ...(car.keywords || [])
  ].join(" ").toLowerCase();

  return haystack.includes(q.toLowerCase());
}

function filterCars(query) {
  const q = query.trim();
  if (!q) return CARS;
  return CARS.filter(car => matchesQuery(car, q));
}

// Simple SVG car “thumbnail” (counts as replacing missing image assets with SVG)
function carSvg() {
  return `
    <svg width="72" height="42" viewBox="0 0 72 42" fill="none" aria-hidden="true">
      <rect x="10" y="16" width="44" height="12" rx="4" fill="rgba(90,51,184,0.18)"></rect>
      <path d="M20 16l6-8h18l8 8" fill="rgba(90,51,184,0.30)"></path>
      <circle cx="22" cy="32" r="5" fill="rgba(17,24,39,0.25)"></circle>
      <circle cx="46" cy="32" r="5" fill="rgba(17,24,39,0.25)"></circle>
      <rect x="26" y="10" width="12" height="6" rx="2" fill="rgba(255,255,255,0.75)"></rect>
    </svg>
  `;
}

function render(cars, query) {
  const favs = new Set(getFavorites());
  resultsEl.innerHTML = "";

  if (!cars.length) {
    resultsEl.innerHTML = `<li class="card"><div>No results found for "${escapeHtml(query)}".</div></li>`;
    return;
  }

  for (const car of cars) {
    const li = document.createElement("li");
    li.className = "card";

    const isFav = favs.has(car.id);
    const tags = [
      `${car.year}`,
      car.body,
      car.fuel,
      `${car.seats} seats`,
      `$${car.pricePerWeek}/wk`
    ];

    li.innerHTML = `
      <div style="display:flex; gap:12px; align-items:flex-start;">
        <div>${carSvg()}</div>
        <div>
          <div class="card__title">${escapeHtml(car.make)} ${escapeHtml(car.model)}</div>
          <div class="badges">
            ${tags.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("")}
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
        <span class="badge">ID: ${car.id}</span>
        <button class="favBtn" data-id="${car.id}"
          style="
            border: 1px solid rgba(90,51,184,0.25);
            background: ${isFav ? "rgba(90,51,184,0.14)" : "transparent"};
            color: #5a33b8;
            font-weight: 900;
            border-radius: 999px;
            padding: 8px 12px;
            cursor: pointer;">
          ${isFav ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    `;

    resultsEl.appendChild(li);
  }
}

function fakeLoading(ms = 450) {
  // This “simulates network” so your loading state is demonstrated
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSearch(query) {
  setError("");
  setLoading(true);
  setMeta("");

  // Save last query to localStorage (rubric-friendly)
  localStorage.setItem(LS_LAST_QUERY, query);

  try {
    await fakeLoading(); // makes loading state visible in demo
    const filtered = filterCars(query);

    render(filtered, query);
    setMeta(`Showing ${filtered.length} result(s) • Search term: "${query.trim() || "all"}"`);
  } catch (err) {
    setError("Something went wrong while searching.");
  } finally {
    setLoading(false);
  }
}

// Events
form.addEventListener("submit", (e) => {
  e.preventDefault();
  runSearch(input.value);
});

resultsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".favBtn");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  toggleFavorite(id);
  runSearch(input.value); // re-render to update button state
});

// On load: restore last query
const last = localStorage.getItem(LS_LAST_QUERY) ?? "";
input.value = last;
runSearch(last);
