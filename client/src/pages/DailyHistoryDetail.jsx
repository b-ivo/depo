import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getDailyRecord } from "../services/daysApi";
import { formatCurrency } from "../utils/formatCurrency";

function DailyHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDay() {
    try {
      setLoading(true);
      setError("");

      const response = await getDailyRecord(id);

      setDay(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDay();
  }, [id]);

  if (loading) {
    return (
      <AppLayout
        title="Daily History"
        description="Detailed business day record"
        activePath="/history"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">Loading daily record...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout
        title="Daily History"
        description="Detailed business day record"
        activePath="/history"
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={loadDay}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!day) {
    return null;
  }

  return (
    <AppLayout
      title="Daily History"
      description="Detailed business day record"
      activePath="/history"
    >
      <div className="space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/history")}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to History
        </button>

        {/* Day summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Business Day</p>

              <h1 className="mt-1 text-xl font-bold text-slate-900">
                {new Date(day.date).toLocaleDateString("en-RW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                day.status === "balanced"
                  ? "bg-green-100 text-green-700"
                  : day.status === "shortage"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {day.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Total Sold" value={day.totals?.sold ?? 0} />

            <SummaryCard
              label="Expected Sales"
              value={formatCurrency(day.totals?.expectedSales)}
            />

            <SummaryCard
              label="Expected Cash"
              value={formatCurrency(day.totals?.expectedCash)}
            />

            <SummaryCard
              label="Difference"
              value={formatCurrency(day.difference)}
            />
          </div>
        </div>

        {/* Stock detail */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Stock Details</h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed stock movement for every beer.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
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

                  <th className="px-5 py-3 text-right font-medium text-slate-500">
                    Price
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-slate-500">
                    Expected
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {day.stock?.map((item) => {
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

                      <td className="px-5 py-4 text-right">{item.evening}</td>

                      <td className="px-5 py-4 text-right font-medium">
                        {item.sold}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {formatCurrency(item.price)}
                      </td>

                      <td className="px-5 py-4 text-right font-medium">
                        {formatCurrency(item.expected)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment details */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Payment Details</h2>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <SummaryCard
              label="Mobile Money"
              value={formatCurrency(day.payments?.mobileMoney ?? 0)}
            />

            <SummaryCard
              label="Expected Cash"
              value={formatCurrency(day.totals?.expectedCash)}
            />

            <SummaryCard
              label="Actual Cash"
              value={formatCurrency(day.payments?.actualCash)}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default DailyHistoryDetail;
