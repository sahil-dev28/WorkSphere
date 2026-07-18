import type { Employee } from "@/lib/types";

// Direct + indirect reports of `employeeId`, walked from the flat roster via
// reportingManager links. Used to keep the manager-reassign select from ever
// offering a choice the backend's cycle guard would reject anyway — filtering
// it out client-side is strictly a UX improvement, the PATCH endpoint's own
// wouldCreateCycle() check remains the real enforcement.
export function getDescendantIds(employeeId: string, employees: Employee[]): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const e of employees) {
    if (e.reportingManager) {
      const list = childrenOf.get(e.reportingManager) ?? [];
      list.push(e._id);
      childrenOf.set(e.reportingManager, list);
    }
  }

  const descendants = new Set<string>();
  const queue = [...(childrenOf.get(employeeId) ?? [])];

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (descendants.has(id)) continue;
    descendants.add(id);
    queue.push(...(childrenOf.get(id) ?? []));
  }

  return descendants;
}
