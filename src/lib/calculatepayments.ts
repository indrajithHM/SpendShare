
export function calculatePayments(settlement: Record<string, number>) {
  // Build mutable lists of who owes and who receives
  const debtors = Object.entries(settlement)
    .filter(([, v]) => v < -0.01)
    .map(([id, v]) => ({ id, amount: Math.round(Math.abs(v) * 100) })); // in paise

  const creditors = Object.entries(settlement)
    .filter(([, v]) => v > 0.01)
    .map(([id, v]) => ({ id, amount: Math.round(v * 100) })); // in paise

  const payments: { from: string; to: string; amount: number }[] = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    if (pay > 0) {
      payments.push({ from: debtors[i].id, to: creditors[j].id, amount: pay / 100 });
    }
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 1) i++;
    if (creditors[j].amount < 1) j++;
  }

  return payments;
}