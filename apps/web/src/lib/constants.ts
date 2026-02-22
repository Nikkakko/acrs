/** Default service color when creating a new service */
export const DEFAULT_SERVICE_COLOR = "#53B3CB";

/** Available reservation durations in minutes */
export const RESERVATION_DURATIONS = [
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
  { label: "120 min", value: 120 },
] as const;

/** Search debounce delay in milliseconds */
export const SEARCH_DEBOUNCE_MS = 300;
