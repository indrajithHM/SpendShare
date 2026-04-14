"use client";
import { useState, useEffect, useMemo, useDeferredValue, memo } from "react";
import { ref, onValue, remove } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { Trash2, ChevronDown } from "lucide-react";
import AddExpense from "@/components/AddExpense";
import ExpenseFilter from "@/components/ExpenseFilter";
import SummaryCards from "@/components/SummaryCards";
import BottomNav from "@/components/BottomNav";
import BottomSheet from "@/components/BottomSheet";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryBudgetRing from "@/components/CategoryBudgetRing";
import CategoryExpenseList from "@/components/CategoryExpenseList";
import { useUserCategories } from "@/hooks/useUserCategories";

const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const groupByDate = (expenses: any[]) =>
  expenses.reduce<Record<string, any[]>>((acc, e) => {
    const key = formatDate(e.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

const getMonthKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const ExpenseItem = memo(({ e, onDelete }: { e: any; onDelete: (id: string) => void }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm text-gray-800 truncate">{e.description}</p>
      <p className="text-xs text-gray-400 mt-0.5">{e.bank} · {e.category ?? "Uncategorized"}</p>
    </div>
    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
      <span className={`font-bold text-sm ${e.type === "DEBIT" ? "text-red-500" : "text-green-600"}`}>
        {e.type === "CREDIT" ? "+" : "-"}₹{e.amount.toLocaleString("en-IN")}
      </span>
      <button
        onClick={() => onDelete(e.id)}
        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
));
ExpenseItem.displayName = "ExpenseItem";

export default function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [summary, setSummary] = useState({ debit: 0, credit: 0, banks: {} as Record<string, any> });
  const [period, setPeriod] = useState<{ month: number | null; year: number | null }>({ month: null, year: null });
  const [unsubFn, setUnsubFn] = useState<(() => void) | null>(null);
  const [view, setView] = useState("ADD");
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const { allCategories } = useUserCategories();

  const applyFilter = ({ month, year }: { month: number; year: number }) => {
    if (unsubFn) unsubFn();
    setLoadingExpenses(true);
    setPeriod({ month, year });
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const q = ref(db, `expenses/${auth.currentUser!.uid}/${monthKey}`);
    const unsub = onValue(q, (snap) => {
      if (!snap.exists()) {
        setExpenses([]); setFiltered([]);
        setSummary({ debit: 0, credit: 0, banks: {} });
        setLoadingExpenses(false);
        return;
      }
      const data = Object.entries(snap.val())
        .map(([id, e]: [string, any]) => ({ id, ...e }))
        .sort((a, b) => b.timestamp - a.timestamp);

      let debit = 0, credit = 0, banks: Record<string, any> = {};
      for (const e of data) {
        if (e.type === "DEBIT") debit += e.amount; else credit += e.amount;
        if (!banks[e.bank]) banks[e.bank] = { debit: 0, credit: 0 };
        banks[e.bank][e.type === "DEBIT" ? "debit" : "credit"] += e.amount;
      }
      setExpenses(data); setFiltered(data);
      setSummary({ debit, credit, banks });
      setLoadingExpenses(false);
    });
    setUnsubFn(() => unsub);
  };

  useEffect(() => {
    const now = new Date();
    applyFilter({ month: now.getMonth(), year: now.getFullYear() });
    return () => { unsubFn?.(); };
  }, []);

  useEffect(() => {
    const s = deferredSearch.toLowerCase();
    setFiltered(
      expenses.filter((e) => {
        const matchText = e.description.toLowerCase().includes(s) || String(e.amount).includes(s);
        const matchCat = selectedCategory === null || e.category === selectedCategory;
        return matchText && matchCat;
      })
    );
  }, [deferredSearch, expenses, selectedCategory]);

  const deleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const expense = expenses.find((e) => e.id === id);
    if (!expense) return;
    const monthKey = getMonthKey(expense.timestamp);
    await remove(ref(db, `expenses/${auth.currentUser!.uid}/${monthKey}/${id}`));
  };

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);
  const totalSpent = useMemo(() => filtered.reduce((s, e) => e.type === "DEBIT" ? s + e.amount : s, 0), [filtered]);

  const categoryBudgetSummary = useMemo(() =>
    allCategories.map((cat) => {
      let spent = 0;
      for (const e of filtered) {
        if (e.type === "DEBIT" && (e.category ?? "Others") === cat.key) spent += e.amount;
      }
      const budget = cat.budget ?? null;
      return { key: cat.key, icon: cat.icon, spent, budget, percent: budget ? Math.min((spent / budget) * 100, 150) : 0 };
    }), [allCategories, filtered]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      <div className="py-4">
        <SummaryCards debit={summary.debit} credit={summary.credit} banks={summary.banks} period={period} showDetails={view === "SUMMARY"} />
      </div>

      {view === "ADD" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">New Expense</h2>
          <AddExpense />
        </div>
      )}

      {view === "SUMMARY" && (
        <>
          {/* Budget rings */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {categoryBudgetSummary.map((cat) => (
              <CategoryBudgetRing
                key={cat.key}
                icon={cat.icon}
                name={cat.key}
                spent={cat.spent}
                budget={cat.budget}
                percent={cat.percent}
                onClick={() => { setActiveCategory(cat.key); setShowCategoryDetails(true); }}
              />
            ))}
          </div>

          <ExpenseFilter onApply={applyFilter} onSearch={setSearch} totalSpent={totalSpent} />

          {/* Category filter selector */}
          <button
            onClick={() => setShowCategoryFilter(true)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3.5 py-3 my-3 hover:border-indigo-300 transition-colors"
          >
            <span className="text-sm text-gray-700">{selectedCategory ?? "All Categories"}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Expense list */}
          {loadingExpenses ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading expenses…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No matching transactions</p>
          ) : (
            Object.entries(grouped).map(([date, items]) => {
              const dayTotal = items.reduce((sum, e) => e.type === "DEBIT" ? sum + e.amount : sum - e.amount, 0);
              return (
                <div key={date} className="mb-4">
                  <div className="sticky top-[57px] z-10 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 py-2 px-1 flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-600">📅 {date}</span>
                    <span className="text-xs text-gray-400">₹{dayTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 px-4">
                    {items.map((e) => <ExpenseItem key={e.id} e={e} onDelete={deleteExpense} />)}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}

      <BottomSheet open={showCategoryFilter} onClose={() => setShowCategoryFilter(false)} title="Filter by Category">
        <CategoryGrid
          value={selectedCategory}
          onChange={(cat) => { setSelectedCategory(cat); setShowCategoryFilter(false); }}
          mode="select"
        />
        {selectedCategory && (
          <button
            className="w-full mt-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
            onClick={() => { setSelectedCategory(null); setShowCategoryFilter(false); }}
          >
            Clear Filter
          </button>
        )}
      </BottomSheet>

      <BottomSheet open={showCategoryDetails} onClose={() => setShowCategoryDetails(false)} title={activeCategory ?? ""}>
        <CategoryExpenseList category={activeCategory} expenses={filtered} />
      </BottomSheet>

      <BottomNav mode="dashboard" active={view} setActive={setView} />
    </div>
  );
}
