import { push, ref } from "firebase/database";
import { auth, db } from "./firebase";
import { useState } from "react";
import CategoryGrid from "./CategoryGrid";
import BottomSheet from "./BottomSheet";

import { DEFAULT_CATEGORIES } from "./categories";

const todayISO = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export default function AddExpense() {
  const [category, setCategory] = useState("Groceries");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryMode, setCategoryMode] = useState("select");
  // "select" | "manage"

  const getCategoryIcon = (key) =>
    DEFAULT_CATEGORIES.find((c) => c.key === key)?.icon || "bi-tag";

  const submit = async (e) => {
    e.preventDefault();

    const f = e.target;

    const selectedDate = f.date.value;
    const timestamp = new Date(selectedDate + "T00:00:00").getTime();

    const data = {
      amount: Number(f.amount.value),
      description: f.description.value,
      bank: f.bank.value,
      category, // ✅ NEW
      type: f.type.checked ? "CREDIT" : "DEBIT",
      timestamp,
      createdAt: Date.now(),
    };

    await push(ref(db, `expenses/${auth.currentUser.uid}`), data);

    f.reset();
    f.date.value = todayISO();
    setCategory("Groceries"); // reset category
  };

  return (
    <form onSubmit={submit} className="card p-3 mb-3">
      {/* DATE */}
      <input
        className="form-control mb-2"
        type="date"
        name="date"
        defaultValue={todayISO()}
        required
      />

      <input
        className="form-control mb-2"
        name="amount"
        type="number"
        placeholder="Amount"
        required
      />

      <input
        className="form-control mb-2"
        name="description"
        placeholder="Description"
        required
      />

      <input
        className="form-control mb-2"
        name="bank"
        placeholder="Bank / Card"
        required
      />

      {/* CATEGORY */}
      {/* CATEGORY SELECTOR */}
      <span className="mb-2">Category</span>
      <div
        className="form-control d-flex justify-content-between align-items-center mb-2"
        style={{ cursor: "pointer" }}
        onClick={() => setShowCategoryModal(true)}
      >
        <div className="d-flex align-items-center gap-2">
          <i className={`bi ${getCategoryIcon(category)} fs-5`} />
          <span>{category}</span>
        </div>
        <i className="bi bi-chevron-down text-muted" />
      </div>
      {showCategoryModal && (
        <BottomSheet
          open={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setCategoryMode("select");
          }}
          title={
            categoryMode === "select" ? "Select Category" : "Manage Categories"
          }
        >
          {/* TOP ACTION (INSIDE SHEET) */}
          <div className="d-flex justify-content-end mb-2">
            {categoryMode === "select" ? (
              <button
                className="btn btn-outline-danger p-1"
                onClick={() => setCategoryMode("manage")}
              >
                <i class="bi bi-plus-circle-dotted"> Add / Manage</i>
              </button>
            ) : (
              <button
                className="btn btn-link p-0"
                onClick={() => setCategoryMode("select")}
              >
                ← Back
              </button>
            )}
          </div>

          {/* CATEGORY GRID */}
          <CategoryGrid
            value={category}
            onChange={(cat) => {
              if (categoryMode === "select") {
                setCategory(cat);
                setShowCategoryModal(false);
              }
            }}
            mode={categoryMode}
          />
        </BottomSheet>
      )}

      <div className="form-check mb-2">
        <input className="form-check-input" type="checkbox" name="type" />
        <label className="form-check-label">Credit (unchecked = Debit)</label>
      </div>

      <button className="btn btn-success">Add Expense</button>
    </form>
  );
}
