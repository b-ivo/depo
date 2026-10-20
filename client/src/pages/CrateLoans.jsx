import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import CrateLoanForm from "../components/loans/CrateLoanForm";
import CrateLoanTable from "../components/loans/CrateLoanTable";
import EmptyCrateStock from "../components/loans/EmptyCrateStock";
import ReturnForm from "../components/loans/ReturnForm";

import { getBeers } from "../services/beersApi";
import {
  deleteCrateLoan,
  getCrateLoanSummary,
  getCrateLoans,
  getEmptyCrates,
} from "../services/crateLoansApi";
import { useLanguage } from "../i18n/context.js";

const FILTERS = ["all", "outstanding", "partial", "returned", "overdue"];

const FILTER_KEYS = {
  all: "loans.filterAll",
  outstanding: "loans.filterOutstanding",
  partial: "loans.filterPartial",
  returned: "loans.filterReturned",
  overdue: "loans.filterOverdue",
};

function CrateLoans() {
  const { t } = useLanguage();
  const [beers, setBeers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [emptyCrates, setEmptyCrates] = useState([]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [returningLoan, setReturningLoan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (filter === "overdue") {
          params.overdue = "true";
        } else if (filter !== "all") {
          params.status = filter;
        }

        if (search.trim()) {
          params.q = search.trim();
        }

        const [beersRes, loansRes, summaryRes, emptyRes] =
          await Promise.all([
            getBeers(),
            getCrateLoans(params),
            getCrateLoanSummary(),
            getEmptyCrates(),
          ]);

        if (!cancelled) {
          setBeers(beersRes.data || []);
          setLoans(loansRes.data || []);
          setSummary(summaryRes.data || null);
          setEmptyCrates(emptyRes.data || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || t("loans.unableToLoad"));
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
  }, [filter, search, reloadKey, t]);

  function refresh() {
    setReloadKey((key) => key + 1);
  }

  function handleLoanCreated() {
    setShowAddForm(false);
    setNotice(t("loans.recorded"));
    refresh();
  }

  function handleReturnRecorded() {
    setReturningLoan(null);
    setNotice(t("loans.returned"));
    refresh();
  }

  function handleCounted() {
    setNotice(t("loans.counted"));
    refresh();
  }

  async function handleDelete(loan) {
    if (!window.confirm(t("loans.deleteConfirm", { name: loan.borrowerName }))) {
      return;
    }

    try {
      await deleteCrateLoan(loan._id);
      refresh();
    } catch (deleteError) {
      setError(deleteError.message || t("loans.deleteFailed"));
    }
  }

  const summaryCards = [
    {
      label: t("loans.summaryOutstandingLoans"),
      value: summary?.outstandingLoans ?? 0,
      tone: "text-slate-900",
    },
    {
      label: t("loans.summaryOutstandingCrates"),
      value: summary?.outstandingCrates ?? 0,
      tone: "text-amber-700",
    },
    {
      label: t("loans.summaryOverdueLoans"),
      value: summary?.overdueLoans ?? 0,
      tone: summary?.overdueLoans > 0 ? "text-red-700" : "text-slate-900",
    },
    {
      label: t("loans.summaryEmptyCrates"),
      value: summary?.emptyCratesInDepot ?? 0,
      tone: "text-slate-900",
    },
  ];

  return (
    <AppLayout
      title={t("loans.title")}
      description={t("loans.description")}
      activePath="/loans"
    >
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-semibold text-red-800">
              {t("loans.unableToLoad")}
            </h2>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={refresh}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {notice && !error && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        {summary?.overdueLoans > 0 && !error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800">
            {t("loans.overdueAlert", {
              count: summary.overdueLoans,
              days: summary.overdueDays,
            })}
          </div>
        )}

        {!error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs text-slate-500">{card.label}</p>

                <p className={`mt-2 text-2xl font-bold ${card.tone}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {!error && showAddForm && (
          <CrateLoanForm
            beers={beers}
            onSuccess={handleLoanCreated}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {!error && returningLoan && (
          <ReturnForm
            key={returningLoan._id}
            loan={returningLoan}
            onSuccess={handleReturnRecorded}
            onCancel={() => setReturningLoan(null)}
          />
        )}

        {!error && (
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("loans.searchPlaceholder")}
              aria-label={t("loans.searchPlaceholder")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:max-w-xs"
            />

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                    filter === item
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t(FILTER_KEYS[item])}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowAddForm((current) => !current)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                {t("loans.recordLoan")}
              </button>
            </div>
          </div>
        )}

        {!error && loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">{t("loans.loading")}</p>
          </div>
        )}

        {!error && !loading && (
          <CrateLoanTable
            loans={loans}
            onReturn={setReturningLoan}
            onDelete={handleDelete}
          />
        )}

        {!error && !loading && (
          <EmptyCrateStock
            emptyCrates={emptyCrates}
            beers={beers}
            onCounted={handleCounted}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default CrateLoans;
