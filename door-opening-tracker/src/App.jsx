import { useMemo, useRef, useState } from "react";
import { parseCSV } from "./csvParser";
import FlightTable from "./FlightTable";
import DoorForm from "./DoorForm";

export default function App() {
  const fileInputRef = useRef(null);
  const [flights, setFlights] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const selectedFlight = flights.find((flight) => flight.id === selectedId) || null;

  const stats = useMemo(() => {
    const known = flights.filter((flight) => flight.metricMet !== null);
    const met = known.filter((flight) => flight.metricMet === true).length;
    const missed = known.filter((flight) => flight.metricMet === false).length;

    return {
      total: flights.length,
      met,
      missed,
      unknown: flights.length - known.length,
      compliance: known.length ? Math.round((met / known.length) * 100) : 0
    };
  }, [flights]);

  const visibleFlights = useMemo(() => {
    const query = search.trim().toLowerCase();

    return flights.filter((flight) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "MET" && flight.metricMet === true) ||
        (filter === "MISSED" && flight.metricMet === false) ||
        (filter === "UNKNOWN" && flight.metricMet === null);

      const matchesSearch =
        !query ||
        [
          flight.flightNumber,
          flight.gate,
          flight.aircraft,
          flight.aircraftType,
          flight.status
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [flights, filter, search]);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setFileName(file.name);

    try {
      const parsed = await parseCSV(file);
      setFlights(parsed);
      setSelectedId(parsed[0]?.id ?? null);
    } catch (err) {
      console.error(err);
      setError("The CSV could not be parsed. Check that it is a valid CSV file.");
      setFlights([]);
      setSelectedId(null);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  function saveFlight(changes) {
    setFlights((current) =>
      current.map((flight) =>
        flight.id === selectedId ? { ...flight, ...changes } : flight
      )
    );
  }

  function exportJSON() {
    if (!flights.length) {
      setError("Upload a CSV before exporting.");
      return;
    }

    const exportData = flights.map(({ raw, ...flight }) => flight);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `door-opening-results-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearData() {
    setFlights([]);
    setSelectedId(null);
    setFileName("");
    setError("");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">✈</div>
          <div>
            <h1>Door Opening Tracker</h1>
            <p>Airline Operations Dashboard</p>
          </div>
        </div>

        <div className="topbar-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            hidden
          />

          <button
            className="secondary-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? "Reading CSV..." : "Upload CSV"}
          </button>

          <button
            className="primary-button"
            onClick={exportJSON}
            disabled={!flights.length}
          >
            Export JSON
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div>
            <p className="eyebrow">Mainline performance</p>
            <h2>Door opening performance</h2>
            <p>
              Upload yesterday's QRS mainline CSV to calculate NB/WB compliance
              and document follow-up actions.
            </p>
          </div>

          {fileName && (
            <div className="file-chip">
              <span>CSV</span>
              {fileName}
              <button onClick={clearData} title="Clear data">×</button>
            </div>
          )}
        </section>

        {error && <div className="error-banner">{error}</div>}

        <section className="stats-grid">
          <Stat label="Flights" value={stats.total} />
          <Stat label="Metric Met" value={stats.met} />
          <Stat label="Metric Missed" value={stats.missed} />
          <Stat label="Compliance" value={`${stats.compliance}%`} />
        </section>

        <section className="dashboard-grid">
          <div className="panel table-panel">
            <div className="panel-header">
              <div>
                <h2>Flight Records</h2>
                <p>{visibleFlights.length} record{visibleFlights.length === 1 ? "" : "s"} shown</p>
              </div>

              <div className="table-controls">
                <input
                  className="search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search flight, gate..."
                />

                <select
                  className="filter-select"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="ALL">All</option>
                  <option value="MET">Met</option>
                  <option value="MISSED">Missed</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>

            <FlightTable
              flights={visibleFlights}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          <aside className="panel form-panel">
            <DoorForm flight={selectedFlight} onSave={saveFlight} />
          </aside>
        </section>

        <footer className="footer">
          <span>Client-side application — no flight data is uploaded to a server.</span>
          <span>NB: 2:30 &nbsp;•&nbsp; WB: 3:30</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}