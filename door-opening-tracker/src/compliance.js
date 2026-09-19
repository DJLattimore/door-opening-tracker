// src/compliance.js
export function getAircraftType(code = "") {
  const aircraft = String(code).trim();
  const narrow = ["738", "319", "320", "321"];
  const wide = ["787", "777"];

  if (narrow.some(prefix => aircraft.startsWith(prefix))) return "NARROW";
  if (wide.some(prefix => aircraft.startsWith(prefix))) return "WIDE";
  return "UNKNOWN";
}

export function getTargetSeconds(type) {
  if (type === "NARROW") return 2 * 60 + 30; // 2:30
  if (type === "WIDE") return 3 * 60 + 30; // 3:30
  return null;
}

export function parseDoorOpening(raw) {
  if (raw === null || raw === undefined || raw === "" || raw === "—") {
    return null;
  }

  const text = String(raw).trim();
  const parts = text.split(":").map(Number);

  if (parts.length === 2 && parts.every(Number.isFinite)) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const minutes = Number(text);
  return Number.isFinite(minutes) ? minutes * 60 : null;
}

export function checkCompliance(doorOpening, target) {
  if (!Number.isFinite(doorOpening) || !Number.isFinite(target)) return null;
  return doorOpening <= target;
}
