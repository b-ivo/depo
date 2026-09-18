import { formatCurrency } from "../../utils/formatCurrency";
import StatCard from "./StatCard";
import { useLanguage } from "../../i18n/context.js";

function DashboardSummary({ day }) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t("dashboard.totalSold"),
      value: day?.totals?.sold ?? 0,
      description: t("dashboard.cratesSoldToday"),
    },
    {
      title: t("common.expectedSales"),
      value: formatCurrency(day?.totals?.expectedSales),
      description: t("dashboard.totalValueOfSales"),
    },
    {
      title: t("common.expectedCash"),
      value: formatCurrency(day?.totals?.expectedCash),
      description: t("dashboard.cashExpectedAfterMobileMoney"),
    },
    {
      title: t("common.mobileMoney"),
      value: formatCurrency(day?.payments?.mobileMoney),
      description: t("dashboard.mobileMoneyReceived"),
    },
    {
      title: t("common.actualCash"),
      value: formatCurrency(day?.payments?.actualCash),
      description: t("dashboard.cashCounted"),
    },
    {
      title: t("common.difference"),
      value: formatCurrency(day?.difference),
      description: getDifferenceDescription(day?.status, t),
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

function getDifferenceDescription(status, t) {
  if (status === "balanced") {
    return t("dashboard.cashIsBalanced");
  }

  if (status === "shortage") {
    return t("dashboard.cashShortage");
  }

  if (status === "surplus") {
    return t("dashboard.cashSurplus");
  }

  return t("dashboard.notCalculatedYet");
}

export default DashboardSummary;