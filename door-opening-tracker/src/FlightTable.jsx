import { getAircraftType, getTargetSeconds, parseDoorOpening, checkCompliance } from "./compliance";

export default function FlightTable({ flights, selectedId, onSelect }) {
  if (!flights.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✈</div>
        <h3>No flight records loaded</h3>
        <p>Upload the QRS mainline CSV to populate the tracker.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="flight-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Gate</th>
            <th>Status</th>
            <th>Aircraft</th>
            <th>Type</th>
            <th>Door Opening</th>
            <th>Target</th>
            <th>Compliance</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => {
            const type = getAircraftType(flight.aircraft);
            const target = getTargetSeconds(type);
            const doorOpening = parseDoorOpening(flight.doorOpeningRaw);
            const met = checkCompliance(doorOpening, target);

            return (
              <tr
                key={flight.id}
                className={selectedId === flight.id ? "selected-row" : ""}
                onClick={() => onSelect(flight.id)}
              >
                <td className="flight-number">{flight.flightNumber || "—"}</td>
                <td>{flight.gate || "—"}</td>
                <td>{flight.status || "—"}</td>
                <td>{flight.aircraft || "—"}</td>
                <td>
                  <span className={`type-badge type-${type.toLowerCase()}`}>
                    {type}
                  </span>
                </td>
                <td>{flight.doorOpeningRaw || "—"}</td>
                <td>{target ? formatTarget(target) : "—"}</td>
                <td>
                  <span className={`status-badge ${
                    met === true
                      ? "status-met"
                      : met === false
                        ? "status-missed"
                        : "status-unknown"
                  }`}>
                    {met === true ? "YES" : met === false ? "NO" : "N/A"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatTarget(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}
