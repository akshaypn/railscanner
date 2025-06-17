import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trains = JSON.parse(fs.readFileSync(path.join(__dirname, 'trains.json')));

const API_BASE = 'https://indian-railway-api.cyclic.app/trains';

const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API request failed with ${res.status}`);
  return res.json();
};

const runningDaysToNames = (str) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (!str || str.length !== 7) return days;
  return days.filter((_, i) => str[i] === '1');
};

const mapTrain = (t) => {
  const base = t.train_base || t;
  return {
    number: base.train_no,
    name: base.train_name,
    from: base.from_stn_code,
    to: base.to_stn_code,
    src_departure_time: base.from_time,
    dest_arrival_time: base.to_time,
    days: runningDaysToNames(base.running_days)
  };
};

export const getTrainsBetween = async (from, to) => {
  try {
    const json = await fetchJSON(`${API_BASE}/betweenStations/?from=${from}&to=${to}`);
    const data = (json.data || []).map(mapTrain);
    if (data.length > 0) return { data };
  } catch (err) {
    // fallback to local data below
  }
  const data = trains.filter(t => t.from === from && t.to === to);
  return { data };
};

export const getTrainsOnDate = async (from, to, date) => {
  try {
    const json = await fetchJSON(`${API_BASE}/gettrainon?from=${from}&to=${to}&date=${date}`);
    const data = (json.data || []).map(mapTrain);
    if (data.length > 0) return { data };
  } catch (err) {
    // fallback to regular search
  }
  return getTrainsBetween(from, to);
};

export const getRoute = async (trainNo) => {
  try {
    const json = await fetchJSON(`${API_BASE}/getRoute?trainNo=${trainNo}`);
    const route = (json.data || []).map(r => ({
      station_code: r.source_stn_code,
      station_name: r.source_stn_name
    }));
    if (route.length > 0) return { route };
  } catch (err) {
    // fallback to local data below
  }
  const train = trains.find(t => t.number === trainNo);
  if (!train) throw new Error('Train not found');
  return { route: train.route };
};
