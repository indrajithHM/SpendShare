"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  onApply: (filter: { month: number; year: number }) => void;
  onSearch: (q: string) => void;
  totalSpent: number;
}

export default function ExpenseFilter({ onApply, onSearch, totalSpent }: Props) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div className="flex gap-2">
        <select
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <input
          className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          placeholder="Search transactions…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); onSearch(e.target.value); }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">Total spent</span>
        <span className="font-bold text-red-500">₹{totalSpent.toLocaleString("en-IN")}</span>
      </div>

      <button
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        onClick={() => onApply({ month, year })}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Apply Filter
      </button>
    </div>
  );
}
