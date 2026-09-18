import { apiRequest } from "./api";

export function getInventoryMovements(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/inventory-movements${qs ? `?${qs}` : ""}`);
}

export function getBeerMovements(beerId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/inventory-movements/beer/${beerId}${qs ? `?${qs}` : ""}`);
}

export function getDailyMovements(date, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/inventory-movements/day/${date}${qs ? `?${qs}` : ""}`);
}
