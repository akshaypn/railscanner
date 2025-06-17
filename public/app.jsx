const { useState, useEffect } = React;

function App() {
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(setStations)
      .catch(console.error);
  }, []);

  const search = (e) => {
    e.preventDefault();
    const fromCode = from.split(' – ')[0];
    const toCode = to.split(' – ')[0];
    if (!fromCode || !toCode) return;
    const formatted = date ? date.split('-').reverse().join('-') : '';
    const url = `/api/search?from=${fromCode}&to=${toCode}${formatted ? `&date=${formatted}` : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(setResults)
      .catch(err => setResults({ error: err.message }));
  };

  const loadRoute = async (trainNo) => {
    const data = await (await fetch(`/api/route/${trainNo}`)).json();
    alert(`Route for ${trainNo}:\n` + data.route.map(r => `${r.station_name} (${r.station_code})`).join(' → '));
  };

  return (
    <>
      <header className="header"><div className="brand">🚄 RailScanner</div></header>
      <main className="container">
        <form onSubmit={search} className="search-card">
          <label>
            From
            <input list="stations" value={from} onChange={e => setFrom(e.target.value)} required />
          </label>
          <label>
            To
            <input list="stations" value={to} onChange={e => setTo(e.target.value)} required />
          </label>
          <label>
            Date (optional)
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <button type="submit">Search</button>
        </form>

        <datalist id="stations">
          {stations.map(s => <option key={s.code} value={`${s.code} – ${s.name}`} />)}
        </datalist>

        <section id="results">
          {results && !results.data && <div>No trains found.</div>}
          {results && results.data && results.data.length > 0 && (
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Dep</th><th>Arr</th><th>Days</th></tr>
              </thead>
              <tbody>
                {results.data.map(t => (
                  <tr key={t.number} onClick={() => loadRoute(t.number)}>
                    <td>{t.number}</td>
                    <td>{t.name}</td>
                    <td>{t.src_departure_time}</td>
                    <td>{t.dest_arrival_time}</td>
                    <td>{t.days.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
      <footer className="footer">Powered by indian-rail-api</footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
