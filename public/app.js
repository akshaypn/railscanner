document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const trainInput = document.getElementById('train');
  const dateInput = document.getElementById('date');
  const resultsEl = document.getElementById('results');
  const baseURL = window.location.protocol === 'file:' ? 'http://localhost:4000' : '';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const train = trainInput.value.trim();
    if (!train) return;
    resultsEl.textContent = 'Loading...';
    try {
      const info = await (await fetch(`${baseURL}/api/train/${train}`)).json();
      let status = {};
      const date = dateInput.value.trim();
      if (date) {
        status = await (await fetch(`${baseURL}/api/status/${train}?date=${date}`)).json();
      }
      renderResults(info, status);
    } catch (err) {
      resultsEl.textContent = err.message;
    }
  });

  function renderResults(info, status) {
    resultsEl.innerHTML = `<pre>${JSON.stringify({ info, status }, null, 2)}</pre>`;
  }
});
