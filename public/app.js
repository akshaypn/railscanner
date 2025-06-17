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
