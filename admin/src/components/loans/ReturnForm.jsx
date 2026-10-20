import { useState } from "react";
import Modal from "../Modal";
import { recordCrateReturn } from "../../services/crateLoansApi";
import { useLanguage } from "../../i18n/context.js";

function ReturnForm({ loan, onSuccess, onClose }) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({});
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openLines = loan.lines.filter(
    (line) => line.crates - (line.returned ?? 0) > 0,
  );

  const totalToReturn = openLines.reduce((sum, line) => {
    const value = Number(counts[line.beer] ?? 0);

    return sum + (Number.isInteger(value) && value > 0 ? value : 0);
  }, 0);

  function updateCount(beer, value) {
    setCounts((current) => ({ ...current, [beer]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const lines = openLines
      .map((line) => ({
        beer: line.beer,
        crates: Number(counts[line.beer] ?? 0),
      }))
      .filter((line) => Number.isInteger(line.crates) && line.crates > 0);

    if (lines.length === 0) {
      setError(t("loans.cratesInvalid"));
      return;
    }

    const invalid = lines.some((line) => {
      const loanLine = openLines.find(
        (item) => item.beer === line.beer,
      );

      return line.crates > loanLine.crates - (loanLine.returned ?? 0);
    });

    if (invalid) {
      setError(t("loans.cratesInvalid"));
      return;
    }

    try {
      setLoading(true);

      const response = await recordCrateReturn(loan._id, {
        lines,
        note: note.trim() || undefined,
      });

      onSuccess?.(response.data);
    } catch (submitError) {
      setError(submitError.message || t("loans.returnFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={t("loans.returnTitle")} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-slate-500">{t("loans.returnDesc")}</p>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {openLines.map((line) => {
            const owed = line.crates - (line.returned ?? 0);

            return (
              <div
                key={line.beer}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {line.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {t("loans.owed")}: {owed}
                  </p>
                </div>

                <input
                  type="number"
                  min="0"
                  max={owed}
                  step="1"
                  value={counts[line.beer] ?? ""}
                  onChange={(event) =>
                    updateCount(line.beer, event.target.value)
                  }
                  disabled={loading}
                  placeholder="0"
                  aria-label={`${line.name} ${t("loans.returned")}`}
                  className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </div>
            );
          })}
        </div>

        <div>
          <label
            htmlFor="return-note"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {t("loans.returnNote")}
          </label>

          <input
            id="return-note"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("loans.returnNotePlaceholder")}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />
        </div>

        <p className="text-sm font-medium text-slate-900">
          {t("loans.totalCrates")}: {totalToReturn}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("loans.saving") : t("loans.saveReturn")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ReturnForm;
