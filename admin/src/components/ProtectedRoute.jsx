import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("adminToken");
  const userData = localStorage.getItem("adminUser");

  // No authentication
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    return <Navigate to="/login" replace />;
  }

  // User does not have the required role
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "superadmin") {
      return <Navigate to="/superadmin" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;