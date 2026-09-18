import { useLanguage } from "../../i18n/context.js";

function InventoryTable({ movements = [] }) {
  const { t } = useLanguage();
  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(date) {
    if (!date) return "—";

    return new Date(date).toLocaleTimeString("en-RW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getMovementLabel(type) {
    const labels = {
      fulfillment: t("inventory.typeFulfillment"),
      purchase: t("inventory.typePurchase"),
      adjustment: t("inventory.typeAdjustment"),
    };

    return labels[type] || type || t("common.unknown");
  }

  function getMovementClasses(type) {
    if (type === "fulfillment") {
      return "bg-blue-100 text-blue-700";
    }

    if (type === "purchase") {
      return "bg-green-100 text-green-700";
    }

    if (type === "adjustment") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">{t("inventory.movementsTitle")}</h2>

        <p className="mt-1 text-sm text-slate-500">
          {t("inventory.movementsDesc")}
        </p>
      </div>

      {movements.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-slate-500">
            {t("inventory.noMovements")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Beer
                </th>

                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  Quantity
                </th>

                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Time
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {movements.map((movement) => (
                <tr key={movement._id}>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {movement.beer?.name || t("inventory.unknownBeer")}
                      </p>

                      {movement.beer?.price !== undefined && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {movement.beer.price.toLocaleString()} RWF
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getMovementClasses(
                        movement.type,
                      )}`}
                    >
                      {getMovementLabel(movement.type)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-slate-900">
                    {movement.quantity ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(movement.date)}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {formatTime(movement.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InventoryTable;