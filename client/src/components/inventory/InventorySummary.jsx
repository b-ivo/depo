function InventorySummary({ movements = [] }) {
  const totalMovements = movements.length;

  const totalQuantity = movements.reduce(
    (total, movement) => total + (movement.quantity || 0),
    0,
  );

  const fulfillmentQuantity = movements
    .filter((movement) => movement.type === "fulfillment")
    .reduce((total, movement) => total + (movement.quantity || 0), 0);

  const purchaseQuantity = movements
    .filter((movement) => movement.type === "purchase")
    .reduce((total, movement) => total + (movement.quantity || 0), 0);

  const cards = [
    {
      label: "Total Movements",
      value: totalMovements,
      description: "Inventory records",
    },
    {
      label: "Total Quantity",
      value: totalQuantity,
      description: "Units moved",
    },
    {
      label: "Fulfilled",
      value: fulfillmentQuantity,
      description: "Units fulfilled",
    },
    {
      label: "Purchased",
      value: purchaseQuantity,
      description: "Units purchased",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {card.value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

export default InventorySummary;
