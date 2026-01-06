import { push, ref } from "firebase/database";
import { auth, db } from "./firebase";

const todayISO = () => {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

export default function AddExpense() {
  const submit = async (e) => {
    e.preventDefault();

    const f = e.target;

    // Convert selected date → timestamp (local day)
    const selectedDate = f.date.value;
    const timestamp = new Date(selectedDate + "T00:00:00").getTime();

    const data = {
      amount: Number(f.amount.value),
      description: f.description.value,
      bank: f.bank.value,
      type: f.type.checked ? "CREDIT" : "DEBIT",
      timestamp, // ✅ use selected date
      createdAt: Date.now() // optional audit field
    };

    await push(ref(db, `expenses/${auth.currentUser.uid}`), data);
    f.reset();
    f.date.value = todayISO(); // reset date back to today
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

      <div className="form-check mb-2">
        <input className="form-check-input" type="checkbox" name="type" />
        <label className="form-check-label">
          Credit (unchecked = Debit)
        </label>
      </div>

      <button className="btn btn-success">
        Add Expense
      </button>
    </form>
  );
}
