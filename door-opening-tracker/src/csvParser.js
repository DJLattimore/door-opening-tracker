import Papa from "papaparse";

const clean = (value) => String(value ?? "").trim();

const normalize = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

function getField(row, candidates) {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const wanted = normalize(candidate);
    const key = keys.find((k) => normalize(k) === wanted);
    if (key) return clean(row[key]);
  }
  return "";
}

export function parseDoorOpening(value) {
  if (value === null || value === undefined || value === "") return null;

  const text = clean(value);
  const parts = text.split(":").map(Number);

  if (parts.length === 2 && parts.every(Number.isFinite)) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric * 60 : null;
}

export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) {
    return "—";
  }

  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function getAircraftType(equip) {
  const aircraft = clean(equip).toUpperCase();

  if (["319", "320", "321", "738"].includes(aircraft)) {
    return "NB";
  }

  if (["787", "777"].includes(aircraft)) {
    return "WB";
  }

  return "UNKNOWN";
}

export function getThresholdSeconds(equip) {
  const type = getAircraftType(equip);

  if (type === "NB") return 150;
  if (type === "WB") return 210;

  return null;
}

export function calculateCompliance(equip, doorOpeningSeconds) {
  const threshold = getThresholdSeconds(equip);

  if (threshold === null || doorOpeningSeconds === null) {
    return null;
  }

  return doorOpeningSeconds <= threshold;
}

export function mapFlightRow(row, index) {
  const arrFlight = getField(row, [
    "Arr. Flt.",
    "Arr Flt.",
    "Arrival Flight",
    "Arrival Flight Number"
  ]);

  const depFlight = getField(row, [
    "Dep. Flt.",
    "Dep Flt.",
    "Departure Flight",
    "Departure Flight Number"
  ]);

  const arrGate = getField(row, [
    "ETA/Actual Gate",
    "Sch Arr Gate",
    "Scheduled Arrival Gate",
    "Arrival Gate"
  ]);

  const depGate = getField(row, [
    "ETD/Actual Gate",
    "Sch Dep Gate",
    "Scheduled Departure Gate",
    "Departure Gate"
  ]);

  const equip = getField(row, ["Equip.", "Equip", "Aircraft", "Aircraft Type"]);
  const doorOpeningRaw = getField(row, [
    "Door Opening (Mins.)",
    "Door Opening Mins.",
    "Door Opening",
    "Door Opening (Min.)"
  ]);

  const status = getField(row, [
    "Arr/Dep Status",
    "Arr Dep Status",
    "Arrival/Departure Status",
    "Status"
  ]);

  const flightNumber = arrFlight || depFlight;
  const gate = arrGate || depGate;
  const doorOpeningSeconds = parseDoorOpening(doorOpeningRaw);
  const aircraftType = getAircraftType(equip);
  const thresholdSeconds = getThresholdSeconds(equip);
  const metricMet = calculateCompliance(equip, doorOpeningSeconds);

  return {
    id: `${index}-${flightNumber || "flight"}`,
    flightNumber,
    gate,
    aircraft: equip,
    aircraftType,
    doorOpeningRaw,
    doorOpeningSeconds,
    thresholdSeconds,
    metricMet,
    status,
    reasonNotMet: "",
    correctiveAction: "",
    followUp: "",
    prePositioning: "",
    raw: row
  };
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors?.length) {
          console.warn("CSV parsing warnings:", results.errors);
        }

        resolve(results.data.map(mapFlightRow));
      },
      error: (error) => reject(error)
    });
  });
}