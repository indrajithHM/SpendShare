export function calculateSettlement(members, expenses, settlements = {}) {
  const memberIds = Object.keys(members);

  let paid = {};
  let owed = {};

  memberIds.forEach(id => {
    paid[id] = 0; // paise
    owed[id] = 0; // paise
  });

  const toPaise = n => Math.round(n * 100);

  // 1️⃣ EXPENSES
  expenses.forEach(e => {
    paid[e.paidBy] += toPaise(e.amount);

    Object.entries(e.participants || {}).forEach(([uid, p]) => {
      const share = Number(p.share || 0);
      owed[uid] += toPaise(share);
    });
  });

  // 2️⃣ SUBTRACT SETTLEMENTS
  Object.values(settlements || {}).forEach(s => {
    const amt = toPaise(s.amount);
    paid[s.from] += amt;
    paid[s.to] -= amt;
  });

  // 3️⃣ FINAL BALANCE (rupees)
  let settlement = {};
  memberIds.forEach(id => {
    settlement[id] = (paid[id] - owed[id]) / 100;
  });

  return { settlement };
}
