import type { Employee } from "@/lib/types";

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
