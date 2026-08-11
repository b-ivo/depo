import { useState } from "react";
import { beers } from "./data/beers";

function App() {
  const [morningStock, setMorningStock] = useState(
    beers.map((beer) => ({
      beerId: beer.id,
      quantity: "",
    })),
  );

  const [eveningStock, setEveningStock] = useState(
    beers.map((beer) => ({
      beerId: beer.id,
      quantity: "",
    })),
  );

  const [mobileMoney, setMobileMoney] = useState("");
  const [actualCash, setActualCash] = useState("");

  function handleMorningStockChange(beerId, quantity) {
    setMorningStock((current) =>
      current.map((stock) =>
        stock.beerId === beerId ? { ...stock, quantity } : stock,
      ),
    );
  }

  function handleEveningStockChange(beerId, quantity) {
    setEveningStock((current) =>
      current.map((stock) =>
        stock.beerId === beerId ? { ...stock, quantity } : stock,
      ),
    );
  }

  const totals = beers.reduce(
    (total, beer) => {
      const morning = morningStock.find((stock) => stock.beerId === beer.id);

      const evening = eveningStock.find((stock) => stock.beerId === beer.id);

      const morningQuantity = Number(morning?.quantity || 0);
      const eveningQuantity = Number(evening?.quantity || 0);

      const sold = morningQuantity - eveningQuantity;
      const expected = sold * beer.price;

      return {
        sold: total.sold + sold,
        expected: total.expected + expected,
      };
    },
    {
      sold: 0,
      expected: 0,
    },
  );

  const mobileMoneyAmount = Number(mobileMoney || 0);
  const actualCashAmount = Number(actualCash || 0);

  const expectedCash = totals.expected - mobileMoneyAmount;

  const difference = actualCashAmount - expectedCash;

  let status = "Balanced";

  if (difference < 0) {
    status = "Shortage";
  } else if (difference > 0) {
    status = "Surplus";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mini DEPO</h1>

        <p className="text-gray-500">Daily stock management</p>
      </header>

      <main>
        {/* STOCK SECTION */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Daily Stock</h2>

            <p className="text-sm text-gray-500">
              Enter the quantity available at the beginning and end of the day.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-semibold text-gray-600">
                    Beer
                  </th>

                  <th className="pb-3 text-sm font-semibold text-gray-600">
                    Price / Crate
                  </th>

                  <th className="pb-3 text-sm font-semibold text-gray-600">
                    Morning
                  </th>

                  <th className="pb-3 text-sm font-semibold text-gray-600">
                    Evening
                  </th>

                  <th className="pb-3 text-sm font-semibold text-gray-600">
                    Sold
                  </th>

                  <th className="pb-3 text-sm font-semibold text-gray-600">
                    Expected
                  </th>
                </tr>
              </thead>

              <tbody>
                {beers.map((beer) => {
                  const morning = morningStock.find(
                    (stock) => stock.beerId === beer.id,
                  );

                  const evening = eveningStock.find(
                    (stock) => stock.beerId === beer.id,
                  );

                  const morningQuantity = Number(morning?.quantity || 0);

                  const eveningQuantity = Number(evening?.quantity || 0);

                  const sold = morningQuantity - eveningQuantity;

                  const expected = sold * beer.price;

                  return (
                    <tr key={beer.id} className="border-b">
                      <td className="py-4 font-medium">{beer.name}</td>

                      <td className="py-4">
                        {beer.price.toLocaleString()} RWF
                      </td>

                      <td className="py-4">
                        <input
                          type="number"
                          min="0"
                          value={morning?.quantity ?? ""}
                          onChange={(event) =>
                            handleMorningStockChange(
                              beer.id,
                              event.target.value,
                            )
                          }
                          className="w-32 rounded-lg border px-3 py-2 outline-none focus:ring-2"
                          placeholder="0"
                        />
                      </td>

                      <td className="py-4">
                        <input
                          type="number"
                          min="0"
                          value={evening?.quantity ?? ""}
                          onChange={(event) =>
                            handleEveningStockChange(
                              beer.id,
                              event.target.value,
                            )
                          }
                          className="w-32 rounded-lg border px-3 py-2 outline-none focus:ring-2"
                          placeholder="0"
                        />
                      </td>

                      <td className="py-4">{sold}</td>

                      <td className="py-4 font-medium">
                        {expected.toLocaleString()} RWF
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="border-t-2">
                  <td colSpan="4" className="pt-4 text-right font-bold">
                    Total
                  </td>

                  <td className="pt-4 font-bold">{totals.sold}</td>

                  <td className="pt-4 font-bold">
                    {totals.expected.toLocaleString()} RWF
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* RECONCILIATION SECTION */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Daily Reconciliation
            </h2>

            <p className="text-sm text-gray-500">
              Record payments and compare expected cash with the physical cash
              counted.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Mobile Money
              </label>

              <input
                type="number"
                min="0"
                value={mobileMoney}
                onChange={(event) => setMobileMoney(event.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Actual Cash
              </label>

              <input
                type="number"
                min="0"
                value={actualCash}
                onChange={(event) => setActualCash(event.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Expected Sales</p>

              <p className="mt-1 text-xl font-bold">
                {totals.expected.toLocaleString()} RWF
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Mobile Money</p>

              <p className="mt-1 text-xl font-bold">
                {mobileMoneyAmount.toLocaleString()} RWF
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Expected Cash</p>

              <p className="mt-1 text-xl font-bold">
                {expectedCash.toLocaleString()} RWF
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Difference</p>

              <p className="mt-1 text-xl font-bold">
                {difference.toLocaleString()} RWF
              </p>

              <p className="mt-1 text-sm font-semibold">{status}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
