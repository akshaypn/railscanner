# RailScanner

RailScanner is a tiny proof‑of‑concept that demonstrates how to look up train information from the Indian Railways API on RapidAPI. It consists of a small Express backend and a minimal HTML/JavaScript front end.

## Features

- Search details of a train by train number
- Optionally fetch live status for a specific departure date

## Project Structure

```
railscanner/
├─ server.js      # Express API and static file server
├─ railApi.js     # Thin wrapper around the RapidAPI endpoints
└─ public/
   ├─ index.html  # Front-end UI
   ├─ app.js      # Client-side logic
   └─ styles.css  # UI styling
```

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:4000](http://localhost:4000).

3. Run the backend unit tests
   ```bash
   npm test
   ```

## API Endpoints

- `GET /api/train/:number` – train details from RapidAPI
- `GET /api/status/:number?date=YYYYMMDD` – live train status

Set the environment variable `RAPIDAPI_KEY` with your RapidAPI key for the requests to succeed.

## License

Released under the MIT License.
