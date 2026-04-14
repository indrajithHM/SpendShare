"use client";

interface Props {
  category: string | null;
  expenses: any[];
}

export default function CategoryExpenseList({ category, expenses }: Props) {
  const list = expenses.filter(
    (e) => e.type === "DEBIT" && (e.category ?? "Others") === category
  );
  const total = list.reduce((s, e) => s + e.amount, 0);

  if (!list.length) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No expenses in this category
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        Total: <span className="font-bold text-red-500">₹{total.toLocaleString("en-IN")}</span>
      </p>
      <div className="space-y-2">
        {list.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
            <div>
              <p className="font-medium text-sm text-gray-800">{e.description}</p>
              <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleDateString("en-IN")}</p>
            </div>
            <span className="font-bold text-sm text-red-500">₹{e.amount.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
