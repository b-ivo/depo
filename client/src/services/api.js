const API_URL = `${import.meta.env.VITE_API_URL}/api`;

console.log("API URL:", API_URL);

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

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

  // Token is missing, expired, or invalid
  if (response.status === 401) {
    localStorage.removeItem("token");

    // Don't redirect if we're already on the login page
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw new Error(data.message || "Authentication required.");
  }

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong."
    );

    error.code = data.code;

    throw error;
  }

  return data;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}