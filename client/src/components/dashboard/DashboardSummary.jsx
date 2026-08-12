import { formatCurrency } from "../../utils/formatCurrency";
import StatCard from "./StatCard";

function DashboardSummary({ day }) {
  const cards = [
    {
      title: "Total Sold",
      value: day?.totals?.sold ?? 0,
      description: "Crates sold today",
    },
    {
      title: "Expected Sales",
      value: formatCurrency(day?.totals?.expectedSales),
      description: "Total value of sales",
    },
    {
      title: "Expected Cash",
      value: formatCurrency(day?.totals?.expectedCash),
      description: "Cash expected after Mobile Money",
    },
    {
      title: "Mobile Money",
      value: formatCurrency(day?.payments?.mobileMoney),
      description: "Mobile Money received",
    },
    {
      title: "Actual Cash",
      value: formatCurrency(day?.payments?.actualCash),
      description: "Cash counted",
    },
    {
      title: "Difference",
      value: formatCurrency(day?.difference),
      description: getDifferenceDescription(day?.status),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
        />
      ))}
    </div>
  );
}

function getDifferenceDescription(status) {
  if (status === "balanced") {
    return "Cash is balanced";
  }

  if (status === "shortage") {
    return "Cash shortage";
  }

  if (status === "surplus") {
    return "Cash surplus";
  }

  return "Not calculated yet";
}

export default DashboardSummary;
