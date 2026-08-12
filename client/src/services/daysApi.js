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

export async function closeBusinessDay() {
  const response = await fetch("http://localhost:5000/api/days/close", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to close business day.");
  }

  return data;
}

export async function getDailyRecord(id) {
  const response = await fetch(`http://localhost:5000/api/days/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to retrieve daily record.");
  }

  return data;
}

export async function startBusinessDay() {
  const response = await fetch("http://localhost:5000/api/days/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to start business day.");
  }

  return data;
}

export async function getCurrentDay() {
  const response = await fetch("http://localhost:5000/api/days/current");

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Failed to retrieve current business day.",
    );

    error.code = data.code;

    throw error;
  }

  return data;
}