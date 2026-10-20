import { useLanguage } from "../../i18n/context.js";

const STATUS_STYLES = {
  outstanding: "bg-amber-100 text-amber-800",
  partial: "bg-blue-100 text-blue-800",
  returned: "bg-emerald-100 text-emerald-800",
};

const STATUS_KEYS = {
  outstanding: "loans.statusOutstanding",
  partial: "loans.statusPartial",
  returned: "loans.statusReturned",
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString();
}

function CrateLoanTable({ loans, onReturn, onDelete }) {
  const { t } = useLanguage();

  if (loans.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">{t("loans.noLoans")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <div
          key={loan._id}
          className={`rounded-xl border bg-white p-5 shadow-sm ${
            loan.overdue ? "border-red-300" : "border-slate-200"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {loan.borrowerName}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {formatDate(loan.date)}

                {loan.phone ? ` · ${loan.phone}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS_STYLES[loan.status] ?? STATUS_STYLES.outstanding
                }`}
              >
                {t(STATUS_KEYS[loan.status] ?? STATUS_KEYS.outstanding)}
              </span>

              {loan.overdue && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                  {t("loans.daysOverdue", { days: loan.daysOverdue })}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">
                    {t("loans.beerType")}
                  </th>

                  <th className="px-3 py-2 text-right font-medium text-slate-500">
                    {t("loans.crates")}
                  </th>

                  <th className="px-3 py-2 text-right font-medium text-slate-500">
                    {t("loans.returned")}
                  </th>

                  <th className="px-3 py-2 text-right font-medium text-slate-500">
                    {t("loans.owed")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loan.lines.map((line) => {
                  const returned = line.returned ?? 0;
                  const owed = line.crates - returned;

                  return (
                    <tr key={line.beer}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {line.name}
                      </td>

                      <td className="px-3 py-2 text-right">{line.crates}</td>

                      <td className="px-3 py-2 text-right">{returned}</td>

                      <td
                        className={`px-3 py-2 text-right font-medium ${
                          owed > 0 ? "text-red-700" : "text-slate-500"
                        }`}
                      >
                        {owed}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td className="px-3 py-2 font-medium text-slate-900">
                    {t("loans.totalCrates")}
                  </td>

                  <td className="px-3 py-2 text-right font-semibold">
                    {loan.totalCrates}
                  </td>

                  <td className="px-3 py-2 text-right font-semibold">
                    {loan.returnedCrates}
                  </td>

                  <td className="px-3 py-2 text-right font-semibold">
                    {loan.outstandingCrates}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {loan.notes && (
            <p className="mt-3 text-sm text-slate-500">{loan.notes}</p>
          )}

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {loan.outstandingCrates > 0 ? (
              <button
                type="button"
                onClick={() => onReturn(loan)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                {t("loans.recordReturn")}
              </button>
            ) : (
              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-700">
                {t("loans.returnedOfTotal", {
                  returned: loan.returnedCrates,
                  total: loan.totalCrates,
                })}
              </span>
            )}

            {loan.returnedCrates === 0 && (
              <button
                type="button"
                onClick={() => onDelete(loan)}
                className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                {t("loans.deleteLoan")}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CrateLoanTable;
