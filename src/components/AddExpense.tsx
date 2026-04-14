"use client";
import { useState } from "react";
import { push, ref } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "./CategoryIcon";
import CategoryGrid from "./CategoryGrid";
import BottomSheet from "./BottomSheet";
import { ChevronDown, PlusCircle } from "lucide-react";

const todayISO = () => new Date().toISOString().split("T")[0];
const getMonthKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function AddExpense() {
  const [category, setCategory] = useState("Groceries");
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"select" | "manage">("select");
  const [isCredit, setIsCredit] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCategoryIcon = (key: string) =>
    DEFAULT_CATEGORIES.find((c) => c.key === key)?.icon || "Tag";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const f = e.currentTarget;
    const fd = new FormData(f);
    const selectedDate = fd.get("date") as string;
    const timestamp = new Date(selectedDate + "T00:00:00").getTime();
    const data = {
      amount: Number(fd.get("amount")),
      description: fd.get("description") as string,
      bank: fd.get("bank") as string,
      category,
      type: isCredit ? "CREDIT" : "DEBIT",
      timestamp,
      createdAt: Date.now(),
    };
    const monthKey = getMonthKey(timestamp);
    await push(ref(db, `expenses/${auth.currentUser!.uid}/${monthKey}`), data);
    f.reset();
    (f.querySelector('[name="date"]') as HTMLInputElement).value = todayISO();
    setCategory("Groceries");
    setIsCredit(false);
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        type="date"
        name="date"
        defaultValue={todayISO()}
        required
      />

      <input
        className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        name="amount"
        type="number"
        placeholder="Amount (₹)"
        required
      />

      <input
        className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        name="description"
        placeholder="Description"
        required
      />

      <input
        className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        name="bank"
        placeholder="Bank / Card"
        required
      />

      {/* Category Picker */}
      <button
        type="button"
        onClick={() => setShowCategorySheet(true)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-3 bg-white hover:border-indigo-300 transition-colors"
      >
        <div className="flex items-center gap-2.5 text-sm text-gray-700">
          <CategoryIcon name={getCategoryIcon(category)} className="w-4.5 h-4.5 text-indigo-500" />
          <span>{category}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Credit toggle */}
      <label className="flex items-center gap-3 px-1 cursor-pointer select-none">
        <div
          className={`w-11 h-6 rounded-full transition-colors relative ${isCredit ? "bg-green-500" : "bg-gray-200"}`}
          onClick={() => setIsCredit((v) => !v)}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isCredit ? "translate-x-5.5 left-0.5" : "left-0.5"}`} />
        </div>
        <span className="text-sm text-gray-600">{isCredit ? "Credit (income)" : "Debit (expense)"}</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-60"
      >
        <PlusCircle className="w-4.5 h-4.5" />
        {loading ? "Adding…" : "Add Expense"}
      </button>

      <BottomSheet
        open={showCategorySheet}
        onClose={() => { setShowCategorySheet(false); setCategoryMode("select"); }}
        title={categoryMode === "select" ? "Select Category" : "Manage Categories"}
      >
        <div className="flex justify-end mb-3">
          {categoryMode === "select" ? (
            <button
              type="button"
              className="text-xs text-indigo-600 font-medium flex items-center gap-1 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50"
              onClick={() => setCategoryMode("manage")}
            >
              + Manage categories
            </button>
          ) : (
            <button
              type="button"
              className="text-xs text-gray-500 font-medium"
              onClick={() => setCategoryMode("select")}
            >
              ← Back
            </button>
          )}
        </div>
        <CategoryGrid
          value={category}
          onChange={(cat) => {
            if (categoryMode === "select") {
              setCategory(cat);
              setShowCategorySheet(false);
            }
          }}
          mode={categoryMode}
        />
      </BottomSheet>
    </form>
  );
}
