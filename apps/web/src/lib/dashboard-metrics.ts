const DAY_MS = 24 * 60 * 60 * 1000;

function joinTime(joiningDate: string): number | null {
  const time = new Date(joiningDate).getTime();
  return Number.isNaN(time) ? null : time;
}

export function joinedWithin(roster: { joiningDate: string }[], now: Date, days = 30): number {
  const end = now.getTime();
  const start = end - days * DAY_MS;
  return roster.filter((employee) => {
    const time = joinTime(employee.joiningDate);
    return time !== null && time > start && time <= end;
  }).length;
}

export function monthlyHeadcount(roster: { joiningDate: string }[], now: Date, months = 12): number[] {
  const times = roster.map((employee) => joinTime(employee.joiningDate)).filter((t): t is number => t !== null);
  return Array.from({ length: months }, (_, i) => {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i) + 1, 0, 23, 59, 59, 999).getTime();
    return times.filter((time) => time <= monthEnd).length;
  });
}

export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
