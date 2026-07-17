export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
