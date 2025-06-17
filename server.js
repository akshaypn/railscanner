import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getTrainsBetween, getTrainsOnDate, getRoute } from "./railService.js";
import fs from "fs";

const stations = JSON.parse(
  fs.readFileSync(new URL("./stations.json", import.meta.url))
);

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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚂 RailScanner backend up on :${PORT}`));
}

export default app;
