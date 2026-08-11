import { apiRequest } from "./api";

export function getBeers() {
  return apiRequest("/beers");
}

export function createBeer(name, price) {
  return apiRequest("/beers", {
    method: "POST",
    body: JSON.stringify({
      name,
      price,
    }),
  });
}

export function updateBeer(id, data) {
  return apiRequest(`/beers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function updateBeerStatus(id, active) {
  return apiRequest(`/beers/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      active,
    }),
  });
}
