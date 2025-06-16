// RAILSCANNER – Minimal "Skyscanner‑style" web app for Indian Railways
// -----------------------------------------------------------------------------
//   Stack: Node.js (Express) backend + vanilla JS frontend (served from /public)
//   Data source: AniCrad/indian-rail-api wrapper (npm package indian-rail-api)
// -----------------------------------------------------------------------------
// Folder layout (single‑repo):
//   railscanner/
//   ├─ server.js            ← Express API proxy & static hosting
//   ├─ railService.js       ← Thin wrapper around indian-rail-api
//   ├─ package.json
//   ├─ stations.json        ← Offline list of { code, name, state } for autocomplete
//   └─ public/
//        ├─ index.html      ← UI
//        ├─ app.js          ← Front‑end logic (fetches /api/*)
//        └─ styles.css      ← Minimal styling
// -----------------------------------------------------------------------------
// 1️⃣ package.json – install deps & scripts
// -----------------------------------------------------------------------------
/*
{
  "name": "railsanner",
  "version": "0.1.0",
  "description": "Skyscanner‑like explorer for Indian Railways",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "indian-rail-api": "^1.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  },
  "license": "MIT"
}
*/

// -----------------------------------------------------------------------------
// 2️⃣ railService.js – helper functions that call AniCrad API
// -----------------------------------------------------------------------------
import rail from "indian-rail-api";

export const getTrainsBetween = (from, to) =>
  new Promise((resolve, reject) => {
    rail.getTrainBtwStation(from, to, (res) => {
      try {
        resolve(JSON.parse(res));
      } catch (e) {
        reject(e);
      }
    });
  });

export const getTrainsOnDate = (from, to, dateDDMMYYYY) =>
  new Promise((resolve, reject) => {
    rail.getTrainOnDate(from, to, dateDDMMYYYY, (res) => {
      try {
        resolve(JSON.parse(res));
      } catch (e) {
        reject(e);
      }
    });
  });

export const getRoute = (trainNo) =>
  new Promise((resolve, reject) => {
    rail.getRoute(trainNo, (res) => {
      try {
        resolve(JSON.parse(res));
      } catch (e) {
        reject(e);
      }
    });
  });

// -----------------------------------------------------------------------------
// 3️⃣ server.js – Express gateway (handles CORS + serves /public)
// -----------------------------------------------------------------------------
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getTrainsBetween, getTrainsOnDate, getRoute } from "./railService.js";
import stations from "./stations.json" assert { type: "json" };

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // frontend

// --- API --------------------------------------------------------------------
app.get("/api/stations", (_, res) => res.json(stations));

app.get("/api/search", async (req, res) => {
  try {
    const { from, to, date } = req.query; // date optional (DD-MM-YYYY)
    if (!from || !to) return res.status(400).json({ error: "from & to required" });
    const data = date
      ? await getTrainsOnDate(from, to, date)
      : await getTrainsBetween(from, to);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/route/:trainNo", async (req, res) => {
  try {
    const data = await getRoute(req.params.trainNo);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- boot -------------------------------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚂 RailScanner backend up on :${PORT}`));

// -----------------------------------------------------------------------------
// 4️⃣ public/index.html – minimal UI (autocomplete + results table)
// -----------------------------------------------------------------------------
/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RailScanner – Explore Indian Trains</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="container">
    <h1>🚄 RailScanner</h1>

    <form id="searchForm">
      <label>
        From
        <input list="stations" id="from" required />
      </label>
      <label>
        To
        <input list="stations" id="to" required />
      </label>
      <label>
        Date (optional)
        <input type="date" id="date" />
      </label>
      <button type="submit">Search</button>
    </form>

    <datalist id="stations"></datalist>

    <section id="results"></section>
  </main>
  <script src="app.js"></script>
</body>
</html>
*/

// -----------------------------------------------------------------------------
// 5️⃣ public/app.js – client‑side logic
// -----------------------------------------------------------------------------
/*
(async () => {
  // Populate station autocomplete once on load
  const list = document.getElementById("stations");
  const stations = await (await fetch("/api/stations")).json();
  stations.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = `${s.code} – ${s.name}`;
    list.appendChild(opt);
  });

  // Handle search
  const form = document.getElementById("searchForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fromCode = document.getElementById("from").value.split(" – ")[0];
    const toCode = document.getElementById("to").value.split(" – ")[0];
    const dateRaw = document.getElementById("date").value; // YYYY‑MM‑DD
    const date = dateRaw ? dateRaw.split("-").reverse().join("-") : ""; // DD‑MM‑YYYY
    const url = `/api/search?from=${fromCode}&to=${toCode}${date ? `&date=${date}` : ""}`;
    const data = await (await fetch(url)).json();
    renderResults(data);
  });

  function renderResults(resp) {
    const container = document.getElementById("results");
    container.innerHTML = "";
    if (!resp?.data?.length) {
      container.textContent = "No trains found.";
      return;
    }
    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th>#</th><th>Name</th><th>Dep</th><th>Arr</th><th>Days</th></tr></thead>`;
    const tbody = document.createElement("tbody");
    resp.data.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.number}</td><td>${t.name}</td><td>${t.src_departure_time}</td><td>${t.dest_arrival_time}</td><td>${t.days.join(", ")}</td>`;
      tr.addEventListener("click", () => loadRoute(t.number));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  }

  async function loadRoute(trainNo) {
    const data = await (await fetch(`/api/route/${trainNo}`)).json();
    alert(`Route for ${trainNo}:\n` + data.route.map((r) => `${r.station_name} (${r.station_code})`).join(" → "));
  }
})();
*/

// -----------------------------------------------------------------------------
// 6️⃣ public/styles.css – tiny CSS reset + layout (suit yourself!)
// -----------------------------------------------------------------------------
/*
body { font-family: system-ui, sans-serif; margin: 0; }
.container { max-width: 800px; margin: auto; padding: 1rem; }
form { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1rem; }
input, button { padding: .4rem; font-size: 1rem; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: .4rem .6rem; text-align: left; }
tr:hover { background-color: #f6f6f6; cursor: pointer; }
*/

// -----------------------------------------------------------------------------
// 7️⃣ stations.json – you can fetch an official list elsewhere; include a tiny sample
// -----------------------------------------------------------------------------
/*
[
  { "code": "NDLS", "name": "New Delhi", "state": "Delhi" },
  { "code": "BCT",  "name": "Mumbai Central", "state": "Maharashtra" },
  { "code": "HWH",  "name": "Howrah Jn", "state": "West Bengal" }
  /* … full 7k+ station list recommended … */
]
*/

// -----------------------------------------------------------------------------
// 🏃‍♂️ Quick Start
// -----------------------------------------------------------------------------
//   1. git clone <this‑repo> && cd railscanner
//   2. npm i
//   3. npm run dev   # starts backend on :4000 and serves UI at http://localhost:4000
//   4. Open browser → search trains, click a row for full route.
//
// ✨ Enhancements to try next:
//   • "Anywhere" mode: leave from/to blank → show all outgoing/arriving trains
//   • Fare & seat‑availability integration (IRCTC captcha makes it harder 🫠)
//   • Progressive Web App + offline caching of static schedule
//   • Map view powered by Leaflet or Google Maps
// -----------------------------------------------------------------------------
