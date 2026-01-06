import { useState } from "react";

export default function ExpenseFilter({ onApply, onSearch }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  return (
    <div className="card p-3 mb-3">
      <div className="row g-2 mb-2">
        <div className="col-6">
          <select
            className="form-select"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6">
          <input
            className="form-control"
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
          />
        </div>
      </div>

      {/* 🔍 SEARCH */}
      <input
        className="form-control mb-2"
        placeholder="Search by description or amount"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          onSearch(e.target.value);
        }}
      />

      <button
        className="btn btn-primary w-100"
        onClick={() => onApply({ month, year })}
      >
        Apply
      </button>
    </div>
  );
}
