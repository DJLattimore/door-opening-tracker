import { useEffect, useState } from "react";

export default function DoorForm({ flight, onSave }) {
  const [form, setForm] = useState({
    reasonNotMet: "",
    correctiveAction: "",
    followUp: "",
    prePositioning: ""
  });

  useEffect(() => {
    if (!flight) return;

    setForm({
      reasonNotMet: flight.reasonNotMet || "",
      correctiveAction: flight.correctiveAction || "",
      followUp: flight.followUp || "",
      prePositioning: flight.prePositioning || ""
    });
  }, [flight]);

  if (!flight) {
    return (
      <div className="form-empty">
        <span>☝</span>
        <h3>Select a flight</h3>
        <p>Choose a row in the flight table to view or edit its details.</p>
      </div>
    );
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <form className="door-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div>
          <p className="eyebrow">Selected flight</p>
          <h2>{flight.flightNumber || "Unknown flight"}</h2>
        </div>

        <span className={`status-badge ${
          flight.metricMet === true
            ? "status-met"
            : flight.metricMet === false
              ? "status-missed"
              : "status-unknown"
        }`}>
          {flight.metricMet === true ? "MET" : flight.metricMet === false ? "MISSED" : "N/A"}
        </span>
      </div>

      <div className="readonly-grid">
        <Info label="Flight Number" value={flight.flightNumber} />
        <Info label="Gate" value={flight.gate} />
        <Info label="Aircraft" value={flight.aircraft} />
        <Info label="Aircraft Type" value={flight.aircraftType} />
        <Info label="Door Opening" value={flight.doorOpeningRaw} />
        <Info
          label="Target"
          value={flight.thresholdSeconds ? formatTarget(flight.thresholdSeconds) : "N/A"}
        />
      </div>

      <div className="section-label">Manual documentation</div>

      <Field
        label="Reason metric not met"
        value={form.reasonNotMet}
        onChange={(value) => update("reasonNotMet", value)}
        placeholder="Explain why the target was missed..."
      />

      <Field
        label="Corrective action"
        value={form.correctiveAction}
        onChange={(value) => update("correctiveAction", value)}
        placeholder="Document the corrective action..."
      />

      <Field
        label="Follow-up details"
        value={form.followUp}
        onChange={(value) => update("followUp", value)}
        placeholder="Document any follow-up required..."
      />

      <Field
        label="Pre-positioning notes"
        value={form.prePositioning}
        onChange={(value) => update("prePositioning", value)}
        placeholder="Document pre-positioning instructions or observations..."
      />

      <button className="primary-button full-width" type="submit">
        Save Flight Record
      </button>
    </form>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-card">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </label>
  );
}

function formatTarget(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}