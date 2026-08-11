function StockTable({ stock = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Today's Stock</h2>

        <p className="mt-1 text-sm text-slate-500">
          Current stock position for each beer.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
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
                Available
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
            {stock.map((item) => {
              const available = item.morning + item.fulfilled;

              return (
                <tr key={item.beer}>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {item.name}
                  </td>

                  <td className="px-5 py-4 text-right">{item.morning}</td>

                  <td className="px-5 py-4 text-right">{item.fulfilled}</td>

                  <td className="px-5 py-4 text-right font-medium">
                    {available}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {item.evening ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-right">{item.sold ?? "—"}</td>
                </tr>
              );
            })}

            {stock.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-10 text-center text-slate-500"
                >
                  No stock recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockTable;
