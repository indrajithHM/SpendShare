export function calculateSettlement(
  members: Record<string, any>,
  expenses: any[],
  settlements: Record<string, any> = {}
) {
  const memberIds = Object.keys(members);

  let paid: Record<string, number> = {};
  let owed: Record<string, number> = {};

  memberIds.forEach(id => {
    paid[id] = 0; // paise
    owed[id] = 0; // paise
  });

  const toPaise = (n: number) => Math.round(n * 100);

  // 1️⃣ EXPENSES
  expenses.forEach(e => {
    const paidAmount = toPaise(e.amount);
    if (paid[e.paidBy] !== undefined) paid[e.paidBy] += paidAmount;

    const participantOwed: Record<string, number> = {};
    Object.entries(e.participants || {}).forEach(([uid, p]: [string, any]) => {
      participantOwed[uid] = toPaise(Number(p.share || 0));
    });

    const owedTotal = Object.values(participantOwed).reduce((sum, val) => sum + val, 0);
    const diff = paidAmount - owedTotal;
    if (diff !== 0 && Object.keys(participantOwed).length > 0) {
      const adjustId = e.paidBy in participantOwed ? e.paidBy : Object.keys(participantOwed)[0];
      participantOwed[adjustId] += diff;
    }

    Object.entries(participantOwed).forEach(([uid, paise]) => {
      owed[uid] += paise;
    });
  });

  // 2️⃣ SUBTRACT SETTLEMENTS
  Object.values(settlements || {}).forEach((s: any) => {
    const amt = toPaise(s.amount);
    paid[s.from] += amt;
    paid[s.to] -= amt;
  });

  // 3️⃣ FINAL BALANCE (rupees)
  let settlement: Record<string, number> = {};
  memberIds.forEach(id => {
    settlement[id] = (paid[id] - owed[id]) / 100;
  });

  return { settlement };
}
