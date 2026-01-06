export function calculateSettlement(expenses, members) {
  const userIds = Object.keys(members);
  const count = userIds.length;

  const paid = {};
  userIds.forEach(uid => (paid[uid] = 0));

  let total = 0;

  Object.values(expenses || {}).forEach(e => {
    total += e.amount;
    paid[e.paidBy] += e.amount;
  });

  const share = total / count;

  const balances = {};
  userIds.forEach(uid => {
    balances[uid] = +(paid[uid] - share).toFixed(2);
  });

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([uid, bal]) => {
    if (bal > 0) creditors.push({ uid, amount: bal });
    if (bal < 0) debtors.push({ uid, amount: -bal });
  });

  const settlements = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);

    settlements.push({
      from: debtors[i].uid,
      to: creditors[j].uid,
      amount: pay
    });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return settlements;
}
