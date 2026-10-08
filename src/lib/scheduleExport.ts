export interface ScheduleRow {
  month: number;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}

export function exportScheduleCsv(rows: ScheduleRow[]): string {
  const header = "Month,Principal,Interest,Total Payment,Remaining Balance\n";
  const body = rows
    .map((r) => `${r.month},${r.principal},${r.interest},${r.total},${r.balance}`)
    .join("\n");
  return header + body;
}
