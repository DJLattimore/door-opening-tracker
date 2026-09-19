// src/compliance.js
export function getAircraftType(code = "") {
  const narrow = ["738", "319", "320", "321"];
  const wide = ["787", "777"];

  if (narrow.some(prefix => code.startsWith(prefix))) return "NARROW";
  if (wide.some(prefix => code.startsWith(prefix))) return "WIDE";
  return "UNKNOWN";
}

export function getTargetSeconds(type) {
  if (type === "NARROW") return 2 * 60 + 30; // 2:30
  if (type === "WIDE") return 3 * 60 + 30; // 3:30
  return null;
}

export function parseDoorOpening(raw) {
  if (!raw || raw === "—") return null;
  const [min, sec] = raw.split(":").map(Number);
  return min * 60 + sec;
}

export function checkCompliance(doorOpening, target) {
  if (doorOpening == null || target == null) return null;
  return doorOpening <= target;
}
