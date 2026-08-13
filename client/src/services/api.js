const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");
    error.code = data.code;
    throw error;
  }

  return data;
}
