import { calculateSettlement } from "./calculateSettlement";

export default function UserBalanceCards({ members, expenses, settlements }) {
  const { settlement } = calculateSettlement(
    members,
    Object.values(expenses || {}),
    settlements
  );

  return (
    <div className="row g-2 mb-3 display-flex justify-content-center">
      {Object.entries(members).map(([uid, m]) => {
        const balance = settlement[uid] || 0;

        return (
          <div key={uid} className="col-6 col-md-4">
            <div
              className={`card p-2 text-center ${
                balance > 0
                  ? "border-success"
                  : balance < 0
                  ? "border-danger"
                  : "border-secondary"
              }`}
            >
              <strong>{m.name}</strong>
              <div
                className={`fw-bold ${
                  balance > 0
                    ? "text-success"
                    : balance < 0
                    ? "text-danger"
                    : "text-muted"
                }`}
              >
                {balance > 0 && `Gets ₹${balance.toFixed(2)}`}
                {balance < 0 && `Pays ₹${Math.abs(balance).toFixed(2)}`}
                {balance === 0 && "Settled"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
