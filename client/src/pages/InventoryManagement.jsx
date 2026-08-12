import { useCallback, useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventorySummary from "../components/inventory/InventorySummary";

import { getBeers } from "../services/beersApi";

import {
  getInventoryMovements,
  getBeerMovements,
  getDailyMovements,
} from "../services/inventoryApi";

function InventoryManagement() {
  const [movements, setMovements] = useState([]);
  const [beers, setBeers] = useState([]);

  const [selectedBeer, setSelectedBeer] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBeers = useCallback(async () => {
    try {
      const response = await getBeers();

      setBeers(response.data || []);
    } catch (error) {
      console.error("Failed to load beers:", error);
    }
  }, []);

  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (selectedBeer) {
        response = await getBeerMovements(selectedBeer);
      } else if (selectedDate) {
        response = await getDailyMovements(selectedDate);
      } else {
        response = await getInventoryMovements();
      }

      setMovements(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to load inventory movements.");
    } finally {
      setLoading(false);
    }
  }, [selectedBeer, selectedDate]);

  useEffect(() => {
    loadBeers();
  }, [loadBeers]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  function handleBeerChange(value) {
    setSelectedBeer(value);
  }

  function handleDateChange(value) {
    setSelectedDate(value);
  }

  function handleClear() {
    setSelectedBeer("");
    setSelectedDate("");
  }

  return (
    <AppLayout
      title="Inventory"
      description="Track inventory movements"
      activePath="/inventory"
    >
      <div className="space-y-6">
        <InventoryFilters
          beers={beers}
          selectedBeer={selectedBeer}
          selectedDate={selectedDate}
          onBeerChange={handleBeerChange}
          onDateChange={handleDateChange}
          onClear={handleClear}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-800">
              Unable to load inventory
            </h2>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadMovements}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              Loading inventory movements...
            </p>
          </div>
        )}

        {!error && !loading && (
          <>
            <InventorySummary movements={movements} />

            <InventoryTable movements={movements} />
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default InventoryManagement;
