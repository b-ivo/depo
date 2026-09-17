import api from "./api";

export function getBeers() {
  return api.get("/beers").then((response) => response.data);
}

export function createBeer(name, price) {
  return api
    .post("/beers", {
      name,
      price,
    })
    .then((response) => response.data);
}

export function updateBeer(id, data) {
  return api.patch(`/beers/${id}`, data).then((response) => response.data);
}

export function updateBeerStatus(id, active) {
  return api
    .patch(`/beers/${id}/status`, {
      active,
    })
    .then((response) => response.data);
}