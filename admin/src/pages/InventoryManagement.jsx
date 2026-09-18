import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryFilters from "../components/inventory/InventoryFilters";
import InventorySummary from "../components/inventory/InventorySummary";

import { getBeers } from "../services/beersApi";
import api from "../services/api";
import { getAdminUser } from "../utils/auth";
import { useLanguage } from "../i18n/context.js";

import {
  getInventoryMovements,
  getBeerMovements,
  getDailyMovements,
} from "../services/inventoryApi";

function InventoryManagement() {
  const { t } = useLanguage();
  const currentUser = getAdminUser();
  const isAdmin = currentUser?.role === "admin";
  const [movements, setMovements] = useState([]);
  const [beers, setBeers] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  const [selectedBeer, setSelectedBeer] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [beersRes, usersRes] = await Promise.all([
          getBeers(),
          isAdmin ? api.get("/users").catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
        ]);

        if (!cancelled) {
          setBeers(beersRes.data || []);
          if (isAdmin) {
            const staff = (usersRes.data.data || []).filter((u) => u.role === "staff");
            setStaffUsers(staff);
          }
        }
      } catch (error) {
        console.error("Failed to load beers/users:", error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    let cancelled = false;

    const load = async (isPoll = false) => {
      try {
        if (!isPoll) {
          setLoading(true);
          setError("");
        }

        const userParams = selectedUser ? { userId: selectedUser } : {};
        let response;

        if (selectedBeer) {
          response = await getBeerMovements(selectedBeer, userParams);
        } else if (selectedDate) {
          response = await getDailyMovements(selectedDate, userParams);
        } else {
          response = await getInventoryMovements(userParams);
        }

        if (!cancelled) {
          setMovements(response.data || []);
          if (!isPoll) setError("");
        }
      } catch (error) {
        if (!cancelled && !isPoll) {
          setError(error.message || t("inventory.failedToLoad"));
        }
      } finally {
        if (!cancelled && !isPoll) {
          setLoading(false);
        }
      }
    };

    load();

    // Real-time: poll every 5s and refetch on window focus
    const interval = setInterval(() => load(true), 5000);
    const onFocus = () => load(true);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") load(true);
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [selectedBeer, selectedDate, selectedUser, reloadKey, t]);

  function handleBeerChange(value) {
    setSelectedBeer(value);
  }

  function handleDateChange(value) {
    setSelectedDate(value);
  }

  function handleUserChange(value) {
    setSelectedUser(value);
  }

  function handleClear() {
    setSelectedBeer("");
    setSelectedDate("");
    setSelectedUser("");
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
          users={isAdmin ? staffUsers : []}
          selectedBeer={selectedBeer}
          selectedDate={selectedDate}
          selectedUser={selectedUser}
          onBeerChange={handleBeerChange}
          onDateChange={handleDateChange}
          onUserChange={handleUserChange}
          onClear={handleClear}
          showUserFilter={isAdmin}
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
