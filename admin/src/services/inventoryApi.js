import api from "./api";

export function getInventoryMovements(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/inventory-movements${qs ? `?${qs}` : ""}`).then((response) => response.data);
}

export function getBeerMovements(beerId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api
    .get(`/inventory-movements/beer/${beerId}${qs ? `?${qs}` : ""}`)
    .then((response) => response.data);
}

export function getDailyMovements(date, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api
    .get(`/inventory-movements/day/${date}${qs ? `?${qs}` : ""}`)
    .then((response) => response.data);
}