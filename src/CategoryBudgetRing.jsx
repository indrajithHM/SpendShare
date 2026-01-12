export default function CategoryBudgetRing({
  icon,
  name,
  spent,
  budget,
  percent,
  onClick
}) {

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(percent, 100) / 100) * circumference;

  const isOver = budget && spent > budget;

  return (
    <div className="col-4 mb-3">
      <div
  className="card p-2 text-center h-100"
  style={{ cursor: "pointer" }}
  onClick={onClick}
>
        {/* ===== RING ===== */}
        <div className="position-relative d-inline-block mb-1">
          <svg width="80" height="80">
            {/* Base ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#e9ecef"
              strokeWidth="6"
              fill="none"
            />

            {/* Progress ring */}
            {budget && (
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={isOver ? "#dc3545" : "#0d6efd"}
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                style={{
                  transition: "stroke-dashoffset 0.6s ease"
                }}
              />
            )}
          </svg>

          {/* Center icon */}
          <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{ pointerEvents: "none" }}
          >
            <i className={`bi ${icon} fs-4`} />
          </div>
        </div>

        {/* ===== TEXT ===== */}
        <div className="fw-semibold small">{name}</div>

        <div className="small">
          <span className={isOver ? "text-danger fw-semibold" : ""}>
            ₹{spent}
          </span>{" "}
          spent
        </div>

        {budget && (
          <>
            <div className="small text-muted">
              Budget: ₹{budget}
            </div>

            <div
              className={`small ${
                isOver ? "text-danger fw-semibold" : "text-muted"
              }`}
            >
              {Math.round(percent)}%
            </div>
          </>
        )}
      </div>
    </div>
  );
}
