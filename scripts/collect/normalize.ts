export function toIsoDate(input: string | number | Date): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Date invalide: ${String(input)}`);
  }
  return date.toISOString();
}

export function safeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function safeInt(value: unknown, fallback = 0): number {
  const parsed = safeNumber(value);
  return parsed === null ? fallback : Math.trunc(parsed);
}
