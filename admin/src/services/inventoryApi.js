import api from "./api";

export function getInventoryMovements() {
  return api.get("/inventory-movements").then((response) => response.data);
}

export function getBeerMovements(beerId) {
  return api
    .get(`/inventory-movements/beer/${beerId}`)
    .then((response) => response.data);
}

export function getDailyMovements(date) {
  return api
    .get(`/inventory-movements/day/${date}`)
    .then((response) => response.data);
}