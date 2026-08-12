import { useState } from "react";
import { updateBeerStatus } from "../../services/beersApi";

function BeerStatusButton({ beer, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleToggle() {
    setError("");

    try {
      setLoading(true);

      const response = await updateBeerStatus(beer._id, !beer.active);

      onSuccess?.(response.data);
    } catch (error) {
      setError(error.message || "Failed to update beer status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={
          beer.active
            ? "text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            : "text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
        }
      >
        {loading ? "Updating..." : beer.active ? "Deactivate" : "Activate"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default BeerStatusButton;
