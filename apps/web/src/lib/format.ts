export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// A couple of the original seed records predate the joiningDate field
// existing at all — new Date(undefined) is a real Date object (Invalid
// Date), not null, so it silently reaches toLocaleDateString() and prints
// the literal string "Invalid Date" unless guarded here.
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

// Records from before joiningDate existed have no value for it — treat that
// as "oldest" rather than let an Invalid Date produce an unstable sort.
export function joinTimestamp(date: string | Date | undefined | null): number {
  if (!date) return -Infinity;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? -Infinity : time;
}

// "1 yr 4 mo", "5 mo", "3 yr" — omits the month segment only when it's zero
// and there's already a year to show; a brand-new hire still reads "0 mo".
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
