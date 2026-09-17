export function getAdminUser() {
  try {
    const raw = localStorage.getItem("adminUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAdminAuth() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}