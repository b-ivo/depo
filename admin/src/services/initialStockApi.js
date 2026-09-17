import api from "./api";

export function createInitialStock(date, stock) {
  return api
    .post("/initial-stock", {
      date,
      stock,
    })
    .then((response) => response.data);
}