const API_URL = "https://depo-skqx.onrender.com/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("adminToken");

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";

    throw new Error(data.message || "Authentication required.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}