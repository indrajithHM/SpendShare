export function calculateSettlement(members, expenses, settlements = {}) {
  const memberIds = Object.keys(members);
  let paid = {};
  let owed = {};



  memberIds.forEach(id => {
    paid[id] = 0;
    owed[id] = 0;
  });

  // 1️⃣ EXPENSES
  expenses.forEach(e => {
   
    
    paid[e.paidBy] = (paid[e.paidBy] || 0) + e.amount;

    // All split types already have the share calculated in participants
    Object.entries(e.participants || {}).forEach(([uid, p]) => {
      const share = Number(p.share || 0);
      owed[uid] = (owed[uid] || 0) + share;
    });
  });



  // 2️⃣ SUBTRACT SETTLEMENTS
  Object.values(settlements || {}).forEach(s => {
    paid[s.from] = (paid[s.from] || 0) + s.amount;
    paid[s.to] = (paid[s.to] || 0) - s.amount;
  });

 

  // 3️⃣ FINAL BALANCE
  let settlement = {};
  memberIds.forEach(id => {
    settlement[id] = (paid[id] || 0) - (owed[id] || 0);
  });

 

  return { settlement };
}