import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const trains = JSON.parse(fs.readFileSync(path.join(__dirname, 'trains.json')));

export const getTrainsBetween = async (from, to) => {
  const data = trains.filter(t => t.from === from && t.to === to);
  return { data };
};

export const getTrainsOnDate = async (from, to, _dateDDMMYYYY) => {
  return getTrainsBetween(from, to);
};

export const getRoute = async (trainNo) => {
  const train = trains.find(t => t.number === trainNo);
  if (!train) throw new Error('Train not found');
  return { route: train.route };
};
