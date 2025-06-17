# RailScanner

RailScanner is a simple web app inspired by Skyscanner that lets you search for Indian Railways trains. The project uses a Node.js Express backend with a small React front end served from the same server.

## Features

- Autocomplete for station codes using an offline dataset
- Search trains between two stations with an optional date
- Click a result row to see the full route of a train

## Project Structure

```
railscanner/
├─ server.js        # Express API and static file server
├─ railService.js   # Wrapper around indian-rail-api
├─ stations.json    # Station list used for autocomplete
└─ public/
    ├─ index.html    # Front‑end entry
    ├─ app.jsx       # React application
    └─ styles.css    # UI styling
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

- `GET /api/stations` – list of stations for autocomplete
- `GET /api/search?from=XXX&to=YYY[&date=DD-MM-YYYY]` – search trains
- `GET /api/route/:trainNo` – fetch a train's route

## License

Released under the MIT License.
