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
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useLocation } from "react-router-dom";
import BottomSheet from "./BottomSheet";
import CategoryGrid from "./CategoryGrid";
import { useUserCategories } from "./useUserCategories";
import CategoryBudgetRing from "./CategoryBudgetRing";
import CategoryExpenseList from "./CategoryExpenseList";




/* ---------- DATE FORMAT ---------- */
const formatDate = ts => {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/* ---------- GROUP BY DATE ---------- */
const groupByDate = expenses => {
  return expenses.reduce((acc, e) => {
    const key = formatDate(e.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState(null);
const [showCategoryFilter, setShowCategoryFilter] = useState(false);

const [activeCategory, setActiveCategory] = useState(null);
const [showCategoryDetails, setShowCategoryDetails] = useState(false);

  const location = useLocation();
 


  const [summary, setSummary] = useState({
    debit: 0,
    credit: 0,
    banks: {}
  });

  const [period, setPeriod] = useState({ month: null, year: null });
  const [unsubscribe, setUnsubscribe] = useState(null);
  const [view, setView] = useState("ADD");
  const [loadingExpenses, setLoadingExpenses] = useState(true);


  
  useEffect(() => {
  if (location.state?.tab) {
    setView(location.state.tab);
  }
}, [location.state]);


  /* ---------- APPLY FILTER ---------- */
  const applyFilter = ({ month, year }) => {
  if (unsubscribe) unsubscribe();

  setLoadingExpenses(true);
  setPeriod({ month, year });

  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, Number(month) + 1, 0, 23, 59, 59, 999).getTime();

  const q = query(
    ref(db, `expenses/${auth.currentUser.uid}`),
    orderByChild("timestamp"),
    startAt(start),
    endAt(end)
  );

  const unsub = onValue(q, snap => {
    const data = snap.exists()
      ? Object.entries(snap.val())
          .map(([id, e]) => ({ id, ...e }))
          .sort((a, b) => b.timestamp - a.timestamp)
      : [];

    let debit = 0;
    let credit = 0;
    let banks = {};

    data.forEach(e => {
      if (e.type === "DEBIT") debit += e.amount;
      else credit += e.amount;

      if (!banks[e.bank]) banks[e.bank] = { debit: 0, credit: 0 };
      if (e.type === "DEBIT") banks[e.bank].debit += e.amount;
      else banks[e.bank].credit += e.amount;
    });

    setExpenses(data);
    setFiltered(data);
    setSummary({ debit, credit, banks });
    setLoadingExpenses(false); // 🔑 snapshot received
  });

  setUnsubscribe(() => unsub);
};


  /* ---------- SEARCH ---------- */
  useEffect(() => {
  const s = search.toLowerCase();

  setFiltered(
    expenses.filter(e => {
      const matchesText =
        e.description.toLowerCase().includes(s) ||
        String(e.amount).includes(s);

      const matchesCategory =
        selectedCategory === null ||
        e.category === selectedCategory;

      return matchesText && matchesCategory;
    })
  );
}, [search, expenses, selectedCategory]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    const now = new Date();
    applyFilter({ month: now.getMonth(), year: now.getFullYear() });
    return () => unsubscribe && unsubscribe();
  }, []);

  /* ---------- DELETE ---------- */
  const deleteExpense = async id => {
    if (!window.confirm("Delete this expense?")) return;
    await remove(ref(db, `expenses/${auth.currentUser.uid}/${id}`));
  };

  const grouped = groupByDate(filtered);
  const totalSpent = filtered.reduce(
  (sum, e) => (e.type === "DEBIT" ? sum + e.amount : sum),
  0
);

const { allCategories } = useUserCategories();

const categoryBudgetSummary = allCategories.map(cat => {
  const spent = filtered.reduce((sum, e) => {
    if (e.type !== "DEBIT") return sum;
    if ((e.category ?? "Others") !== cat.key) return sum;
    return sum + e.amount;
  }, 0);

  const budget = cat.budget ?? null;

  return {
    key: cat.key,
    icon: cat.icon,
    spent,
    budget,
    percent: budget ? Math.min((spent / budget) * 100, 150) : 0
  };
});

  return (
    <div className="container pb-5">

      {/* ===== SUMMARY ===== */}
      <SummaryCards
        debit={summary.debit}
        credit={summary.credit}
        banks={summary.banks}
        period={period}
        showDetails={view === "SUMMARY"}
      />

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6 p-3">

          {view === "ADD" && <AddExpense />}

          {view === "SUMMARY" && (
            <>
            
                <div className="row mt-3">
  {categoryBudgetSummary.map(cat => (
    <CategoryBudgetRing
      key={cat.key}
      icon={cat.icon}
      name={cat.key}
      spent={cat.spent}
      budget={cat.budget}
      percent={cat.percent}
      onClick={() => {
        setActiveCategory(cat.key);
        setShowCategoryDetails(true);
      }}
    />
  ))}


    <ExpenseFilter 
              onApply={applyFilter}
               onSearch={setSearch}
                totalSpent={totalSpent}
                 />
</div>

              <div
  className="form-control d-flex justify-content-between align-items-center mb-3"
  style={{ cursor: "pointer" }}
  onClick={() => setShowCategoryFilter(true)}
>
  <span>
    {selectedCategory ?? "All Categories"}
  </span>
  <i className="bi bi-chevron-down text-muted" />
</div>
{/* ===== CATEGORY FILTER POPUP ===== */}
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

  {/* CLEAR FILTER */}
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

                    {/* ===== STICKY DATE HEADER ===== */}
                    <div
                      className="bg-white border-bottom py-2 px-1"
                      style={{
                        position: "sticky",
                        top: "0",
                        zIndex: 10
                      }}
                    >
                      <div className="fw-semibold">📅 {date}</div>
                      <small className="text-muted">
                        Day total: ₹{dayTotal}
                      </small>
                    </div>

                    <ul className="list-group">
                      {items.map(e => (
                        <li
                          key={e.id}
                          className="list-group-item d-flex justify-content-between align-items-start"
                        >
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
                              onClick={() => deleteExpense(e.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </li>
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

    
      <div>
        <BottomNav
  mode="dashboard"
  active={view}
  setActive={setView}
/>

      </div>
  </div>
   
  );
}
