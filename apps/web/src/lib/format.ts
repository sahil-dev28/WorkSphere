export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function joinTimestamp(date: string | Date | undefined | null): number {
  if (!date) return -Infinity;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? -Infinity : time;
}

export function formatTenure(joiningDate: string | Date): string {
  const start = new Date(joiningDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (now.getDate() < start.getDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr`);
  if (months > 0 || years === 0) parts.push(`${months} mo`);

  return parts.join(" ");
}
