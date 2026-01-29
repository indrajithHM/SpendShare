export default function SummaryCards({
  debit,
  credit,
  banks,
  period,
  showDetails,
}) {
  const monthName =
    period?.month !== null
      ? new Date(0, period.month).toLocaleString("default", { month: "long" })
      : "";

  // Sum duplicate bank names (case-insensitive)
  const uniqueBanks = Object.entries(banks).reduce((acc, [bank, values]) => {
    const bankName = bank.trim().toLowerCase(); // Normalize to lowercase

    if (!acc[bankName]) {
      acc[bankName] = { debit: 0, credit: 0, displayName: bank.trim() };
    }

    acc[bankName].debit += values.debit || 0;
    acc[bankName].credit += values.credit || 0;

    return acc;
  }, {});

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card text-bg-danger p-2 text-center">
            <small>Debit</small>
            <strong>₹{debit}</strong>
          </div>
        </div>

        <div className="col-4">
          <div className="card text-bg-success p-2 text-center">
            <small>Credit</small>
            <strong>₹{credit}</strong>
          </div>
        </div>

        <div className="col-4">
          <div className="card text-bg-primary p-2 text-center">
            <small>Net</small>
            <strong>₹{credit - debit}</strong>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="card p-2 ">
          <h6 className="mb-2">Bank / Card Summary</h6>

          {Object.entries(uniqueBanks).map(([bankKey, values]) => (
            <div
              key={bankKey}
              className="d-flex justify-content-between border-bottom py-1"
            >
              <strong>{values.displayName}</strong>
              <span>₹{values.credit - values.debit}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
