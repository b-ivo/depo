import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import HistoryTable from "../components/history/HistoryTable";
import { getDailyHistory, getHistoryByRange } from "../services/daysApi";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/context.js";

function getDateRange(preset) {
  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];

  if (preset === "7days") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: fmt(from), to: fmt(today) };
  }
  if (preset === "30days") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: fmt(from), to: fmt(today) };
  }
  if (preset === "month") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: fmt(from), to: fmt(today) };
  }
  return null;
}

function History() {
  const { t } = useLanguage();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState(false);

  const navigate = useNavigate();

  async function loadHistory(fromDate, toDate) {
    try {
      setLoading(true);
      setError("");

      let response;
      if (fromDate && toDate) {
        response = await getHistoryByRange(fromDate, toDate);
        setFiltered(true);
      } else {
        response = await getDailyHistory();
        setFiltered(false);
      }
      setDays(response.data || []);
    } catch (err) {
      setError(err.message || t("history.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDailyHistory();

        if (!cancelled) {
          setDays(response.data || []);
          setFiltered(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || t("history.failedToLoad"));
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
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    if (!from || !to) {
      setError(t("history.selectBothDates"));
      return;
    }
    loadHistory(from, to);
  }

  function handleReset() {
    setFrom("");
    setTo("");
    loadHistory();
  }

  function handlePreset(preset) {
    const range = getDateRange(preset);
    if (range) {
      setFrom(range.from);
      setTo(range.to);
      loadHistory(range.from, range.to);
    }
  }

  return (
    <AppLayout title={t("history.title")} description={t("history.description")} activePath="/admin/history">
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("common.from")}</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">{t("common.to")}</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <button
            type="button"
            onClick={handleFilter}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Filter
          </button>
          {filtered && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Reset
            </button>
          )}
        </div>

        {/* Presets */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 self-center">{t("common.quick")}</span>
          {[
            { label: t("history.last7Days"), key: "7days" },
            { label: t("history.last30Days"), key: "30days" },
            { label: t("history.thisMonth"), key: "month" },
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePreset(p.key)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => loadHistory()}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">{t("history.loading")}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {filtered && (
            <p className="text-xs text-slate-500">
              {days.length === 1
                ? t("history.showingRecord", { from, to })
                : t("history.showingRecords", { count: days.length, from, to })}
            </p>
          )}
          <HistoryTable
            days={days}
            onSelect={(day) => navigate(`/admin/history/${day._id}`)}
          />
        </>
      )}
    </AppLayout>
  );
}

export default History;