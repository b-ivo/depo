import { useState } from "react";
import { createCrateLoan } from "../../services/crateLoansApi";
import { useLanguage } from "../../i18n/context.js";

function todayISO() {
  const now = new Date();

  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function CrateLoanForm({ beers, onSuccess, onCancel }) {
  const { t } = useLanguage();
  const [borrowerName, setBorrowerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayISO);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ beer: "", crates: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalCrates = lines.reduce((sum, line) => {
    const value = Number(line.crates);

    return sum + (Number.isInteger(value) && value > 0 ? value : 0);
  }, 0);

  function updateLine(index, field, value) {
    setLines((current) =>
      current.map((line, position) =>
        position === index ? { ...line, [field]: value } : line,
      ),
    );
  }

  function addLine() {
    setLines((current) => [...current, { beer: "", crates: "" }]);
  }

  function removeLine(index) {
    setLines((current) =>
      current.length === 1
        ? [{ beer: "", crates: "" }]
        : current.filter((_, position) => position !== index),
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const trimmedName = borrowerName.trim();

    if (!trimmedName) {
      setError(t("loans.borrowerRequired"));
      return;
    }

    const payload = lines
      .filter((line) => line.beer && line.crates !== "")
      .map((line) => ({
        beer: line.beer,
        crates: Number(line.crates),
      }));

    if (payload.length === 0) {
      setError(t("loans.cratesInvalid"));
      return;
    }

    if (payload.some((line) => !Number.isInteger(line.crates) || line.crates < 1)) {
      setError(t("loans.cratesInvalid"));
      return;
    }

    try {
      setLoading(true);

      const response = await createCrateLoan({
        borrowerName: trimmedName,
        phone: phone.trim() || undefined,
        date,
        notes: notes.trim() || undefined,
        lines: payload,
      });

      onSuccess?.(response.data);
    } catch (submitError) {
      setError(submitError.message || t("loans.createFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("loans.addTitle")}
        </h2>

        <p className="mt-1 text-sm text-slate-500">{t("loans.addDesc")}</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="loan-borrower"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t("loans.borrowerName")}
            </label>

            <input
              id="loan-borrower"
              type="text"
              value={borrowerName}
              onChange={(event) => setBorrowerName(event.target.value)}
              placeholder={t("loans.borrowerPlaceholder")}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="loan-phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {t("loans.phone")}
            </label>

            <input
              id="loan-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("loans.phonePlaceholder")}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="loan-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {t("loans.loanDate")}
          </label>

          <input
            id="loan-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 sm:w-64"
          />
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">
              {t("loans.beerType")} / {t("loans.crates")}
            </p>

            <button
              type="button"
              onClick={addLine}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {t("loans.addLine")}
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
              >
                <div>
                  <label
                    htmlFor={`loan-beer-${index}`}
                    className="mb-1.5 block text-xs font-medium text-slate-600 sm:sr-only"
                  >
                    {t("loans.beerType")}
                  </label>

                  <select
                    id={`loan-beer-${index}`}
                    value={line.beer}
                    onChange={(event) =>
                      updateLine(index, "beer", event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  >
                    <option value="">{t("loans.selectBeer")}</option>

                    {beers.map((beer) => (
                      <option key={beer._id} value={beer._id}>
                        {beer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`loan-crates-${index}`}
                    className="mb-1.5 block text-xs font-medium text-slate-600 sm:sr-only"
                  >
                    {t("loans.crates")}
                  </label>

                  <input
                    id={`loan-crates-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={line.crates}
                    onChange={(event) =>
                      updateLine(index, "crates", event.target.value)
                    }
                    disabled={loading}
                    placeholder={t("loans.crates")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("loans.removeLine")}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 text-sm font-medium text-slate-900">
            {t("loans.totalCrates")}: {totalCrates}
          </p>
        </div>

        <div>
          <label
            htmlFor="loan-notes"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {t("loans.notes")}
          </label>

          <textarea
            id="loan-notes"
            rows="2"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t("loans.notesPlaceholder")}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
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
            {loading ? t("loans.saving") : t("loans.recordLoan")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CrateLoanForm;
