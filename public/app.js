document.addEventListener('DOMContentLoaded', () => {
  const stationList = document.getElementById('stations');
  const fromInput = document.getElementById('from');
  const toInput = document.getElementById('to');
  const dateInput = document.getElementById('date');
  const form = document.getElementById('searchForm');
  const resultsEl = document.getElementById('results');

  fetch('/api/stations')
    .then(res => res.json())
    .then(stations => {
      stationList.innerHTML = stations
        .map(s => `<option value="${s.code} – ${s.name}"></option>`) 
        .join('');
    })
    .catch(console.error);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fromCode = fromInput.value.split(' – ')[0];
    const toCode = toInput.value.split(' – ')[0];
    if (!fromCode || !toCode) return;
    const formatted = dateInput.value ? dateInput.value.split('-').reverse().join('-') : '';
    const url = `/api/search?from=${fromCode}&to=${toCode}${formatted ? `&date=${formatted}` : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => renderResults(data))
      .catch(err => {
        resultsEl.textContent = err.message;
      });
  });

  function renderResults(results) {
    resultsEl.innerHTML = '';
    if (!results.data || results.data.length === 0) {
      resultsEl.textContent = 'No trains found.';
      return;
    }
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>#</th><th>Name</th><th>Dep</th><th>Arr</th><th>Days</th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    results.data.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.number}</td><td>${t.name}</td><td>${t.src_departure_time}</td><td>${t.dest_arrival_time}</td><td>${t.days.join(', ')}</td>`;
      tr.addEventListener('click', () => loadRoute(t.number));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultsEl.appendChild(table);
  }

  async function loadRoute(trainNo) {
    const data = await (await fetch(`/api/route/${trainNo}`)).json();
    alert(`Route for ${trainNo}:\n` + data.route.map(r => `${r.station_name} (${r.station_code})`).join(' → '));
  }
});
