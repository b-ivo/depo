import { apiRequest } from "./api";

export function createInitialStock(date, stock) {
  return apiRequest("/initial-stock", {
    method: "POST",
    body: JSON.stringify({
      date,
      stock,
    }),
  });
}
