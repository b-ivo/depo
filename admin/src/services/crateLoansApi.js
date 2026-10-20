import api from "./api";

export function getCrateLoans(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/crate-loans${qs ? `?${qs}` : ""}`).then((response) => response.data);
}

export function getCrateLoanSummary() {
  return api.get("/crate-loans/summary").then((response) => response.data);
}

export function getCrateLoan(id) {
  return api.get(`/crate-loans/${id}`).then((response) => response.data);
}

export function createCrateLoan(data) {
  return api.post("/crate-loans", data).then((response) => response.data);
}

export function recordCrateReturn(id, data) {
  return api.post(`/crate-loans/${id}/returns`, data).then((response) => response.data);
}

export function deleteCrateLoan(id) {
  return api.delete(`/crate-loans/${id}`).then((response) => response.data);
}
