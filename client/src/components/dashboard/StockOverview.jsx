function StockOverview({ day }) {
  if (!day?.stock?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Stock Overview</h2>

        <p className="mt-2 text-sm text-slate-500">
          No stock has been recorded for today.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Today's Stock</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-slate-500">
                Beer
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Morning
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Fulfilled
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Evening
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Sold
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {day.stock.map((item) => (
              <tr key={item.beer}>
                <td className="px-5 py-4 font-medium text-slate-900">
                  {item.name}
                </td>

                <td className="px-5 py-4 text-right">{item.morning}</td>

                <td className="px-5 py-4 text-right">{item.fulfilled}</td>

                <td className="px-5 py-4 text-right">{item.evening ?? "—"}</td>

                <td className="px-5 py-4 text-right font-medium">
                  {item.sold ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockOverview;
