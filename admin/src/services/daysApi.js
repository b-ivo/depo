import api from "./api";

export function getDailyHistory() {
  return api.get("/days").then((response) => response.data);
}

export function getDayById(id) {
  return api.get(`/days/${id}`).then((response) => response.data);
}

export function getHistoryByRange(from, to) {
  return api
    .get(`/days/history/range?from=${from}&to=${to}`)
    .then((response) => response.data);
}

export function startDay() {
  return api.post("/days/start").then((response) => response.data);
}

export function recordFulfillment(beer, quantity) {
  return api
    .post("/days/fulfillment", {
      beer,
      quantity,
    })
    .then((response) => response.data);
}

export function recordEveningStock(stock) {
  return api
    .patch("/days/evening-stock", {
      stock,
    })
    .then((response) => response.data);
}

export function recordMobileMoney(mobileMoney) {
  return api
    .patch("/days/mobile-money", {
      mobileMoney,
    })
    .then((response) => response.data);
}

export function recordActualCash(actualCash) {
  return api
    .patch("/days/actual-cash", {
      actualCash,
    })
    .then((response) => response.data);
}

export function closeDay() {
  return api.post("/days/close").then((response) => response.data);
}

export function closeBusinessDay() {
  return api.post("/days/close").then((response) => response.data);
}

export function getDailyRecord(id) {
  return api.get(`/days/${id}`).then((response) => response.data);
}

export function startBusinessDay() {
  return api.post("/days/start").then((response) => response.data);
}

export function getCurrentDay() {
  return api.get("/days/current").then((response) => response.data);
}

export function addBeerToCurrentDay(beer) {
  return api
    .post("/days/add-beer", {
      beer,
    })
    .then((response) => response.data);
}

export function updateFulfillment(beerId, quantity) {
  return api
    .patch(`/days/fulfillment/${beerId}`, {
      quantity,
    })
    .then((response) => response.data);
}