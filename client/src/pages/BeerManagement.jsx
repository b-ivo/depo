import { useCallback, useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import BeerTable from "../components/beers/BeerTable";
import BeerForm from "../components/beers/BeerForm";
import BeerEditForm from "../components/beers/BeerEditForm";

import { getBeers } from "../services/beersApi";

function BeerManagement() {
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBeer, setEditingBeer] = useState(null);

  const loadBeers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBeers();

      setBeers(response.data || []);
    } catch (error) {
      setError(error.message || "Failed to load beers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBeers();
  }, [loadBeers]);

  function handleBeerCreated(beer) {
    setBeers((currentBeers) =>
      [...currentBeers, beer].sort((a, b) => a.name.localeCompare(b.name)),
    );

    setShowAddForm(false);
  }

  function handleBeerUpdated(updatedBeer) {
    setBeers((currentBeers) =>
      currentBeers
        .map((beer) => (beer._id === updatedBeer._id ? updatedBeer : beer))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );

    setEditingBeer(null);
  }

  function handleStatusChanged(updatedBeer) {
    setBeers((currentBeers) =>
      currentBeers.map((beer) =>
        beer._id === updatedBeer._id ? updatedBeer : beer,
      ),
    );
  }

  function handleAdd() {
    setEditingBeer(null);
    setShowAddForm(true);
  }

  function handleEdit(beer) {
    setShowAddForm(false);
    setEditingBeer(beer);
  }

  return (
    <AppLayout
      title="Beer Management"
      description="Manage the beers sold by the depot"
      activePath="/beers"
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-800">Unable to load beers</h2>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={loadBeers}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && showAddForm && (
          <BeerForm
            onSuccess={handleBeerCreated}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {!error && editingBeer && (
          <BeerEditForm
            beer={editingBeer}
            onSuccess={handleBeerUpdated}
            onCancel={() => setEditingBeer(null)}
          />
        )}

        {!error && loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">Loading beers...</p>
          </div>
        )}

        {!error && !loading && (
          <BeerTable
            beers={beers}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onStatusChanged={handleStatusChanged}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default BeerManagement;
