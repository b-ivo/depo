import { apiRequest } from "./api";

export function getInventoryMovements() {
  return apiRequest("/inventory-movements");
}

export function getBeerMovements(beerId) {
  return apiRequest(`/inventory-movements/beer/${beerId}`);
}

export function getDailyMovements(date) {
  return apiRequest(`/inventory-movements/day/${date}`);
}
