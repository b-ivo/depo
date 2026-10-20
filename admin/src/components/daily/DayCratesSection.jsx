import { useLanguage } from "../../i18n/context.js";

/*
  Empty crate activity of one business day.

  Shows the borrower names, what each of them took and handed back,
  the position of every beer in the depot, and the totals.
*/
function DayCratesSection({ day }) {
  const { t } = useLanguage();

  const totals = day?.crateTotals ?? {};
  const crateLines = day?.emptyCrates ?? [];
  const borrowers = day?.borrowers ?? [];

  const hasActivity = borrowers.length > 0 || totals.lent > 0 || totals.returned > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          {t("historyDetail.crateDetails")}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {t("historyDetail.crateDetailsDesc")}
        </p>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <TotalCard label={t("historyDetail.crateOpening")} value={totals.opening ?? 0} />

        <TotalCard label={t("historyDetail.crateLent")} value={totals.lent ?? 0} tone="amber" />

        <TotalCard label={t("historyDetail.crateReturned")} value={totals.returned ?? 0} tone="green" />

        <TotalCard
          label={t("historyDetail.crateStillOut")}
          value={totals.stillOut ?? 0}
          tone={(totals.stillOut ?? 0) > 0 ? "red" : "slate"}
        />

        <TotalCard
          label={t("historyDetail.crateClosing")}
          value={totals.closing ?? "—"}
        />
      </div>

      {/* Borrowers */}
      <div className="border-t border-slate-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {t("historyDetail.crateBorrowers")}
        </h3>

        {borrowers.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            {t("historyDetail.crateNoActivity")}
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {borrowers.map((borrower) => (
              <li
                key={String(borrower.loan)}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {borrower.borrowerName}
                    </p>

                    {borrower.phone ? (
                      <p className="mt-0.5 text-sm text-slate-500">
                        {borrower.phone}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      borrower.status === "returned"
                        ? "bg-green-100 text-green-700"
                        : borrower.status === "partial"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {t(`loans.status${borrower.status.charAt(0).toUpperCase()}${borrower.status.slice(1)}`)}
                  </span>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-2 text-left font-medium text-slate-500">
                          {t("loans.beerType")}
                        </th>

                        <th className="py-2 text-right font-medium text-slate-500">
                          {t("historyDetail.crateLent")}
                        </th>

                        <th className="py-2 text-right font-medium text-slate-500">
                          {t("historyDetail.crateReturned")}
                        </th>

                        <th className="py-2 text-right font-medium text-slate-500">
                          {t("historyDetail.crateStillOut")}
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50">
                      {borrower.lines.map((line) => (
                        <tr key={String(line.beer ?? line.name)}>
                          <td className="py-2 font-medium text-slate-900">
                            {line.name}
                          </td>

                          <td className="py-2 text-right">
                            {borrower.madeOnThisDay ? line.lent : "—"}
                          </td>

                          <td className="py-2 text-right">
                            {line.returnedSameDay || "—"}
                          </td>

                          <td className="py-2 text-right font-medium">
                            {line.stillOut || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">
                    {t("loans.totalCrates")}:{" "}
                    <span className="font-semibold text-slate-900">
                      {borrower.madeOnThisDay ? borrower.totalCrates : "—"}
                    </span>
                  </span>

                  <span className="text-slate-500">
                    {t("historyDetail.crateReturned")}:{" "}
                    <span className="font-semibold text-slate-900">
                      {borrower.returnedOnThisDay}
                    </span>
                  </span>

                  <span className="text-slate-500">
                    {t("historyDetail.crateStillOut")}:{" "}
                    <span
                      className={`font-semibold ${
                        borrower.stillOut > 0 ? "text-red-600" : "text-slate-900"
                      }`}
                    >
                      {borrower.stillOut}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Depot position per beer */}
      {crateLines.length > 0 ? (
        <div className="border-t border-slate-200">
          <div className="px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {t("historyDetail.cratePerBeer")}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-slate-500">
                    {t("loans.beerType")}
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-slate-500">
                    {t("historyDetail.crateOpening")}
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-slate-500">
                    {t("historyDetail.crateLent")}
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-slate-500">
                    {t("historyDetail.crateReturned")}
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-slate-500">
                    {t("historyDetail.crateClosing")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {crateLines.map((item) => (
                  <tr key={String(item.beer)}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {item.name}
                    </td>

                    <td className="px-5 py-3 text-right">{item.opening}</td>

                    <td className="px-5 py-3 text-right">{item.lent || "—"}</td>

                    <td className="px-5 py-3 text-right">{item.returned || "—"}</td>

                    <td className="px-5 py-3 text-right font-medium">
                      {item.closing ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!hasActivity ? (
        <p className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          {t("historyDetail.crateNoActivity")}
        </p>
      ) : null}
    </div>
  );
}

function TotalCard({ label, value, tone = "slate" }) {
  const tones = {
    slate: "text-slate-900",
    green: "text-green-700",
    amber: "text-amber-700",
    red: "text-red-600",
  };

  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className={`mt-2 text-lg font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default DayCratesSection;
