export function calculateSettlement(
  members: Record<string, any>,
  expenses: any[],
  settlements: Record<string, any> = {}
) {
  const memberIds = Object.keys(members);
  const toPaise = (n: number) => Math.round(n * 100);

  const paid: Record<string, number> = {};
  const owed: Record<string, number> = {};

  memberIds.forEach((id) => {
    paid[id] = 0;
    owed[id] = 0;
  });

  expenses.forEach((e) => {
    if (paid[e.paidBy] !== undefined) paid[e.paidBy] += toPaise(e.amount);
    Object.entries(e.participants || {}).forEach(([uid, p]: [string, any]) => {
      if (owed[uid] !== undefined) owed[uid] += toPaise(Number(p.share || 0));
    });
  });

  Object.values(settlements || {}).forEach((s: any) => {
    const amt = toPaise(s.amount);
    if (paid[s.from] !== undefined) paid[s.from] += amt;
    if (paid[s.to] !== undefined) paid[s.to] -= amt;
  });

  const settlement: Record<string, number> = {};
  memberIds.forEach((id) => {
    settlement[id] = (paid[id] - owed[id]) / 100;
  });

  return { settlement };
}
