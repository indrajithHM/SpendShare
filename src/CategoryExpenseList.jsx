export default function CategoryExpenseList({ category, expenses }) {
  const list = expenses.filter(
    (e) => e.type === "DEBIT" && (e.category ?? "Others") === category,
  );
  const total = list.reduce((s, e) => s + e.amount, 0);

  if (!list.length) {
    return (
      <div className="text-muted text-center py-4">
        No expenses in this category
      </div>
    );
  }

  return (
    <ul className="list-group list-group-flush">
      <div className="mb-2 text-muted small">Total spent: ₹{total}</div>

      {list.map((e) => (
        <li
          key={e.id}
          className="list-group-item d-flex justify-content-between"
        >
          <div>
            <div className="fw-semibold">{e.description}</div>
            <small className="text-muted">
              {new Date(e.timestamp).toLocaleDateString()}
            </small>
          </div>

          <div className="fw-semibold text-danger">₹{e.amount}</div>
        </li>
      ))}
    </ul>
  );
}
