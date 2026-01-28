import {
  ref,
  query,
  orderByChild,
  startAt,
  endAt,
  onValue,
  remove
} from "firebase/database";
import { auth, db } from "./firebase";

import AddExpense from "./AddExpense";
import ExpenseFilter from "./ExpenseFilter";
import SummaryCards from "./SummaryCard";
import BottomNav from "./BottomNav";
import BottomSheet from "./BottomSheet";
import CategoryGrid from "./CategoryGrid";
import CategoryBudgetRing from "./CategoryBudgetRing";
import CategoryExpenseList from "./CategoryExpenseList";
import { useUserCategories } from "./useUserCategories";

import {
  useState,
  useEffect,
  useMemo,
  useDeferredValue,
  memo
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

/* ---------- DATE FORMAT ---------- */
const formatDate = ts => {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

/* ---------- GROUP BY DATE ---------- */
const groupByDate = expenses =>
  expenses.reduce((acc, e) => {
    const key = formatDate(e.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

/* ---------- MEMOIZED EXPENSE ITEM ---------- */
const ExpenseItem = memo(({ e, onDelete }) => (
  <li className="list-group-item d-flex justify-content-between align-items-start">
    <div>
      <strong>{e.description}</strong>
      <br />
      <small className="text-muted">
        {e.bank} · {e.category ?? "Uncategorized"}
      </small>
    </div>

    <div className="text-end">
      <span
        className={
          e.type === "DEBIT"
            ? "text-danger fw-bold"
            : "text-success fw-bold"
        }
      >
        ₹{e.amount}
      </span>
      <br />
      <button
        className="btn btn-sm btn-outline-danger mt-1"
        onClick={() => onDelete(e.id)}
      >
        <i className="bi bi-trash" />
      </button>
    </div>
  </li>
));

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  const [summary, setSummary] = useState({
    debit: 0,
    credit: 0,
    banks: {}
  });

  const [period, setPeriod] = useState({ month: null, year: null });
  const [unsubscribe, setUnsubscribe] = useState(null);
  const [view, setView] = useState("ADD");
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const { allCategories } = useUserCategories();

  /* ---------- HANDLE NAV STATE ---------- */
  useEffect(() => {
    if (location.state?.tab) setView(location.state.tab);
  }, [location.state]);

  /* ---------- APPLY FILTER (FIREBASE QUERY) ---------- */
  const applyFilter = ({ month, year }) => {
    if (unsubscribe) unsubscribe();

    setLoadingExpenses(true);
    setPeriod({ month, year });

    const start = new Date(year, month, 1).getTime();
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();

    const q = query(
      ref(db, `expenses/${auth.currentUser.uid}`),
      orderByChild("timestamp"),
      startAt(start),
      endAt(end)
    );

    const unsub = onValue(q, snap => {
      if (!snap.exists()) {
        setExpenses([]);
        setFiltered([]);
        setSummary({ debit: 0, credit: 0, banks: {} });
        setLoadingExpenses(false);
        return;
      }

      const data = Object.entries(snap.val())
        .map(([id, e]) => ({ id, ...e }))
        .sort((a, b) => b.timestamp - a.timestamp);

      let debit = 0;
      let credit = 0;
      let banks = {};

      for (const e of data) {
        if (e.type === "DEBIT") debit += e.amount;
        else credit += e.amount;

        if (!banks[e.bank]) banks[e.bank] = { debit: 0, credit: 0 };
        banks[e.bank][e.type === "DEBIT" ? "debit" : "credit"] += e.amount;
      }

      setExpenses(data);
      setFiltered(data);
      setSummary({ debit, credit, banks });
      setLoadingExpenses(false);
    });

    setUnsubscribe(() => unsub);
  };

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    const now = new Date();
    applyFilter({ month: now.getMonth(), year: now.getFullYear() });
    return () => unsubscribe && unsubscribe();
  }, []);

  /* ---------- SEARCH + CATEGORY FILTER ---------- */
  useEffect(() => {
    const s = deferredSearch.toLowerCase();

    setFiltered(
      expenses.filter(e => {
        const matchesText =
          e.description.toLowerCase().includes(s) ||
          String(e.amount).includes(s);

        const matchesCategory =
          selectedCategory === null || e.category === selectedCategory;

        return matchesText && matchesCategory;
      })
    );
  }, [deferredSearch, expenses, selectedCategory]);

  /* ---------- DELETE ---------- */
  const deleteExpense = async id => {
    if (!window.confirm("Delete this expense?")) return;
    await remove(ref(db, `expenses/${auth.currentUser.uid}/${id}`));
  };

  /* ---------- MEMOIZED COMPUTATIONS ---------- */
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const totalSpent = useMemo(
    () =>
      filtered.reduce(
        (sum, e) => (e.type === "DEBIT" ? sum + e.amount : sum),
        0
      ),
    [filtered]
  );

  const categoryBudgetSummary = useMemo(() => {
    return allCategories.map(cat => {
      let spent = 0;

      for (const e of filtered) {
        if (e.type === "DEBIT" && (e.category ?? "Others") === cat.key) {
          spent += e.amount;
        }
      }

      const budget = cat.budget ?? null;

      return {
        key: cat.key,
        icon: cat.icon,
        spent,
        budget,
        percent: budget ? Math.min((spent / budget) * 100, 150) : 0
      };
    });
  }, [allCategories, filtered]);

  return (
    <div className="container pb-5">
      {/* ===== SUMMARY ===== */}
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
          <SummaryCards
            debit={summary.debit}
            credit={summary.credit}
            banks={summary.banks}
            period={period}
            showDetails={view === "SUMMARY"}
          />
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6 p-3">
          {view === "ADD" && <AddExpense />}

          {view === "SUMMARY" && (
            <>
              <div className="row mt-3">
                {categoryBudgetSummary.map(cat => (
                  <CategoryBudgetRing
                    key={cat.key}
                    {...cat}
                    name={cat.key}
                    onClick={() => {
                      setActiveCategory(cat.key);
                      setShowCategoryDetails(true);
                    }}
                  />
                ))}

                <div className="mt-3">
                  <ExpenseFilter
                    onApply={applyFilter}
                    onSearch={setSearch}
                    totalSpent={totalSpent}
                  />
                </div>
              </div>

              {/* CATEGORY FILTER */}
              <div
                className="form-control d-flex justify-content-between align-items-center mb-3"
                style={{ cursor: "pointer" }}
                onClick={() => setShowCategoryFilter(true)}
              >
                <span>{selectedCategory ?? "All Categories"}</span>
                <i className="bi bi-chevron-down text-muted" />
              </div>

              <BottomSheet
                open={showCategoryFilter}
                onClose={() => setShowCategoryFilter(false)}
                title="Filter by Category"
              >
                <CategoryGrid
                  value={selectedCategory}
                  onChange={cat => {
                    setSelectedCategory(cat);
                    setShowCategoryFilter(false);
                  }}
                  mode="select"
                />

                {selectedCategory && (
                  <button
                    className="btn btn-outline-secondary w-100 mt-3"
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowCategoryFilter(false);
                    }}
                  >
                    Clear Category Filter
                  </button>
                )}
              </BottomSheet>

              <BottomSheet
                open={showCategoryDetails}
                onClose={() => setShowCategoryDetails(false)}
                title={activeCategory}
              >
                <CategoryExpenseList
                  category={activeCategory}
                  expenses={filtered}
                />
              </BottomSheet>

              {/* EXPENSE LIST */}
              {Object.entries(grouped).map(([date, items]) => {
                const dayTotal = items.reduce(
                  (sum, e) =>
                    e.type === "DEBIT"
                      ? sum + e.amount
                      : sum - e.amount,
                  0
                );

                return (
                  <div key={date} className="mb-4">
                    <div
                      className="bg-white border-bottom py-2 px-1"
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      <div className="fw-semibold">📅 {date}</div>
                      <small className="text-muted">
                        Day total: ₹{dayTotal}
                      </small>
                    </div>

                    <ul className="list-group">
                      {items.map(e => (
                        <ExpenseItem
                          key={e.id}
                          e={e}
                          onDelete={deleteExpense}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}

              {loadingExpenses ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-2" />
                  <div className="text-muted">Loading expenses…</div>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-muted text-center">
                  No matching transactions
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      <BottomNav mode="dashboard" active={view} setActive={setView} />
    </div>
  );
}
