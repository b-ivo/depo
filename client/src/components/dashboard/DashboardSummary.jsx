import { formatCurrency } from "../../utils/formatCurrency";

function DashboardSummary({ day }) {
  const cards = [
    {
      label: "Total Sold",
      value: day?.totals?.sold ?? 0,
    },
    {
      label: "Expected Sales",
      value: formatCurrency(day?.totals?.expectedSales),
    },
    {
      label: "Expected Cash",
      value: formatCurrency(day?.totals?.expectedCash),
    },
    {
      label: "Mobile Money",
      value: formatCurrency(day?.payments?.mobileMoney ?? 0),
    },
    {
      label: "Actual Cash",
      value: formatCurrency(day?.payments?.actualCash),
    },
    {
      label: "Difference",
      value: formatCurrency(day?.difference),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">{card.label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardSummary;
