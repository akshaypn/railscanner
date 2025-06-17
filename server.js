import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchTrain, liveStatus } from './railApi.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/train/:number', async (req, res) => {
  try {
    const data = await searchTrain(req.params.number);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status/:number', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  try {
    const data = await liveStatus(req.params.number, date);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚂 RailScanner backend up on :${PORT}`));
}

export default app;
