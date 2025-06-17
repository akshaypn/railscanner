const API_HOST = 'indian-railway-irctc.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}`;

function buildHeaders() {
  const key = process.env.RAPIDAPI_KEY || '';
  return {
    'x-rapidapi-key': key,
    'x-rapidapi-host': API_HOST,
    'x-rapid-api': 'rapid-api-database'
  };
}

export async function searchTrain(trainNumber) {
  const url = `${BASE_URL}/api/trains-search/v1/train/${trainNumber}?isH5=true&client=web`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`API request failed with ${res.status}`);
  return res.json();
}

export async function liveStatus(trainNumber, departureDate) {
  const url = `${BASE_URL}/api/trains/v1/train/status?train_number=${trainNumber}&departure_date=${departureDate}&isH5=true&client=web`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`API request failed with ${res.status}`);
  return res.json();
}
