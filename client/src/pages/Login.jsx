import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log("Login response:", data);

      // Save JWT
      localStorage.setItem("token", data.data.token);

      // Go to dashboard
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-gray-800 p-8 rounded-2xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Mini DEPO
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Login to your account
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-white mb-2">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full h-11 px-4 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-white mb-2">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full h-11 px-4 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}