import { formatCurrency } from "../../utils/formatCurrency";

function HistoryTable({ days = [], onSelect }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-slate-500">
                Date
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Sold
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Expected Sales
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Mobile Money
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Actual Cash
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Difference
              </th>

              <th className="px-5 py-3 text-center font-medium text-slate-500">
                Status
              </th>

              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {days.map((day) => (
              <tr key={day._id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-900">
                  {new Date(day.date).toLocaleDateString("en-RW", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>

                <td className="px-5 py-4 text-right">
                  {day.totals?.sold ?? 0}
                </td>

                <td className="px-5 py-4 text-right">
                  {formatCurrency(day.totals?.expectedSales)}
                </td>

                <td className="px-5 py-4 text-right">
                  {formatCurrency(day.payments?.mobileMoney ?? 0)}
                </td>

                <td className="px-5 py-4 text-right">
                  {formatCurrency(day.payments?.actualCash)}
                </td>

                <td
                  className={`px-5 py-4 text-right font-medium ${
                    day.difference < 0
                      ? "text-red-600"
                      : day.difference > 0
                        ? "text-blue-600"
                        : "text-green-600"
                  }`}
                >
                  {formatCurrency(day.difference)}
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      day.status === "balanced"
                        ? "bg-green-100 text-green-700"
                        : day.status === "shortage"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {day.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onSelect(day)}
                    className="font-medium text-slate-700 hover:text-slate-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {days.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No completed business days yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryTable;
