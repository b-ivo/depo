import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventorySummary from "../components/inventory/InventorySummary";

import { getBeers } from "../services/beersApi";
import { useLanguage } from "../i18n/context.js";

import {
  getInventoryMovements,
  getBeerMovements,
  getDailyMovements,
} from "../services/inventoryApi";

function InventoryManagement() {
  const { t } = useLanguage();
  const [movements, setMovements] = useState([]);
  const [beers, setBeers] = useState([]);

  const [selectedBeer, setSelectedBeer] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getBeers();

        if (!cancelled) {
          setBeers(response.data || []);
        }
      } catch (error) {
        console.error("Failed to load beers:", error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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

        if (!cancelled) {
          setMovements(response.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message || t("inventory.failedToLoad"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedBeer, selectedDate, reloadKey, t]);

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
      title={t("inventory.title")}
      description={t("inventory.description")}
      activePath="/admin/inventory"
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
              {t("inventory.unableToLoad")}
            </h2>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              {t("inventory.loadingMovements")}
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