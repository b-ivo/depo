import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";

function Businesses() {
  const [businesses, setBusinesses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmBusiness, setConfirmBusiness] = useState(null);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [newBusiness, setNewBusiness] = useState({
    name: "",
    location: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setError("");

        const res = await api.get("/businesses");

        setBusinesses(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load businesses.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const resetNewBusiness = () => {
    setNewBusiness({ name: "", location: "" });
  };

  const openAdd = () => {
    setActionError("");
    resetNewBusiness();
    setShowAdd(true);
  };

  const openEdit = (business) => {
    setActionError("");
    setEditing({
      id: business._id,
      name: business.name,
      location: business.location,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    setBusy(true);
    setActionError("");

    try {
      const res = await api.post("/businesses", newBusiness);

      setBusinesses((prev) => [res.data.data, ...prev]);
      setShowAdd(false);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to create business.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setBusy(true);
    setActionError("");

    try {
      const res = await api.patch(`/businesses/${editing.id}`, {
        name: editing.name,
        location: editing.location,
      });

      setBusinesses((prev) =>
        prev.map((b) =>
          b._id === res.data.data._id ? res.data.data : b,
        ),
      );

      setEditing(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update business.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async () => {
    setBusy(true);
    setActionError("");

    try {
      const res = await api.patch(
        `/businesses/${confirmBusiness._id}/status`,
        {
          active: !confirmBusiness.active,
        },
      );

      setBusinesses((prev) =>
        prev.map((b) =>
          b._id === res.data.data._id ? res.data.data : b,
        ),
      );

      setConfirmBusiness(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || "Failed to update business.",
      );
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900";

  const buttonClass =
    "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Businesses
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the depots connected to Mini DEPO.
          </p>
        </div>

        <button onClick={openAdd} className={buttonClass}>
          New business
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500">
                  Name
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Location
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {businesses.map((business) => (
                <tr
                  key={business._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {business.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {business.location}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        business.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {business.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(business)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setActionError("");
                          setConfirmBusiness(business);
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          business.active
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {business.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {businesses.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No businesses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal
          title="New business"
          onClose={() => setShowAdd(false)}
        >
          <form onSubmit={handleCreate} className="space-y-5">
            {actionError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={newBusiness.name}
                onChange={(e) =>
                  setNewBusiness({
                    ...newBusiness,
                    name: e.target.value,
                  })
                }
                required
                className={inputClass}
                placeholder="e.g. Kampala Main Depot"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                value={newBusiness.location}
                onChange={(e) =>
                  setNewBusiness({
                    ...newBusiness,
                    location: e.target.value,
                  })
                }
                required
                className={inputClass}
                placeholder="e.g. Kampala"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className={buttonClass}
              >
                {busy ? "Creating..." : "Create business"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal
          title="Edit business"
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleUpdate} className="space-y-5">
            {actionError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Location
              </label>

              <input
                type="text"
                value={editing.location}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className={buttonClass}
              >
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmBusiness && (
        <Modal
          title={
            confirmBusiness.active
              ? "Deactivate business"
              : "Activate business"
          }
          onClose={() => setConfirmBusiness(null)}
        >
          <p className="text-sm text-slate-600">
            Are you sure you want to{" "}
            <span className="font-medium text-slate-900">
              {confirmBusiness.active
                ? "deactivate"
                : "activate"}
            </span>{" "}
            <span className="font-medium text-slate-900">
              {confirmBusiness.name}
            </span>
            ?
            {confirmBusiness.active &&
              " All users of this business will also be deactivated."}
          </p>

          {actionError && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmBusiness(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleToggle}
              disabled={busy}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                confirmBusiness.active
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {busy ? "Saving..." : "Confirm"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Businesses;