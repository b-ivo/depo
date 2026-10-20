import { apiRequest } from "./api";

export function getCrateLoans(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString();

  return apiRequest(`/crate-loans${query ? `?${query}` : ""}`);
}

export function getCrateLoanSummary() {
  return apiRequest("/crate-loans/summary");
}

export function getCrateLoan(id) {
  return apiRequest(`/crate-loans/${id}`);
}

export function createCrateLoan(data) {
  return apiRequest("/crate-loans", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function recordCrateReturn(id, data) {
  return apiRequest(`/crate-loans/${id}/returns`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteCrateLoan(id) {
  return apiRequest(`/crate-loans/${id}`, {
    method: "DELETE",
  });
}

export function getEmptyCrates() {
  return apiRequest("/empty-crates");
}

export function recordEmptyCrateCount(data) {
  return apiRequest("/empty-crates/count", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
