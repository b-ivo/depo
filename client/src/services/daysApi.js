import { apiRequest } from "./api";

export function getDailyHistory() {
  return apiRequest("/days");
}

export function getDayById(id) {
  return apiRequest(`/days/${id}`);
}

export function getHistoryByRange(from, to) {
  return apiRequest(`/days/history/range?from=${from}&to=${to}`);
}

export function startDay() {
  return apiRequest("/days/start", {
    method: "POST",
  });
}

export function recordFulfillment(beer, quantity) {
  return apiRequest("/days/fulfillment", {
    method: "POST",
    body: JSON.stringify({
      beer,
      quantity,
    }),
  });
}

export function recordEveningStock(stock) {
  return apiRequest("/days/evening-stock", {
    method: "PATCH",
    body: JSON.stringify({
      stock,
    }),
  });
}

export function recordMobileMoney(mobileMoney) {
  return apiRequest("/days/mobile-money", {
    method: "PATCH",
    body: JSON.stringify({
      mobileMoney,
    }),
  });
}

export function recordActualCash(actualCash) {
  return apiRequest("/days/actual-cash", {
    method: "PATCH",
    body: JSON.stringify({
      actualCash,
    }),
  });
}

export function closeDay() {
  return apiRequest("/days/close", {
    method: "POST",
  });
}

export function closeBusinessDay() {
  return apiRequest("/days/close", {
    method: "POST",
  });
}

export function getDailyRecord(id) {
  return apiRequest(`/days/${id}`);
}

export function startBusinessDay() {
  return apiRequest("/days/start", {
    method: "POST",
  });
}

export function getCurrentDay() {
  return apiRequest("/days/current");
}

export function addBeerToCurrentDay(beer) {
  return apiRequest("/days/add-beer", {
    method: "POST",
    body: JSON.stringify({
      beer,
    }),
  });
}

export function updateFulfillment(beerId, quantity) {
  return apiRequest(`/days/fulfillment/${beerId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
    }),
  });
}
