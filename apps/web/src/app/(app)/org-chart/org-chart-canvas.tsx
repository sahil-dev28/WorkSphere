"use client";

import { OrgChart } from "d3-org-chart";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@WorkSphere/ui/components/button";

import { initials } from "@/lib/format";

export interface OrgChartDatum {
  id: string;
  parentId: string | null;
  name: string;
  designation: string;
  department: string;
  departmentColor: string;
  directReports: number;
}

const CONTAINER_SELECTOR = "#org-chart-canvas-root";

// nodeId/parentNodeId accessors are called with either the raw datum (during
// the initial stratify pass) or an already-wrapped HierarchyNode, per the
// (loosely-typed) d3-org-chart API — this narrows either shape back to the
// plain datum.
function toDatum(input: OrgChartDatum | { data: OrgChartDatum }): OrgChartDatum {
  return "data" in input ? input.data : input;
}

function nodeContentHtml(node: OrgChartDatum): string {
  const reportsBadge =
    node.directReports > 0
      ? `<div style="font-size:10px;font-weight:600;color:var(--foreground);background:var(--muted);padding:2px 6px;flex-shrink:0;">${node.directReports}</div>`
      : "";

  return `
    <div style="width:100%;height:100%;box-sizing:border-box;padding:10px 12px;background:var(--card);border:1px solid var(--border);cursor:pointer;font-family:inherit;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:30px;height:30px;border-radius:9999px;background:color-mix(in oklch, ${node.departmentColor}, transparent 85%);color:${node.departmentColor};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;">${initials(node.name)}</div>
        <div style="min-width:0;flex:1;overflow:hidden;">
          <div style="font-size:12px;font-weight:600;color:var(--card-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${node.name}</div>
          <div style="font-size:11px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${node.designation}</div>
        </div>
        ${reportsBadge}
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
        <span style="width:6px;height:6px;border-radius:9999px;background:${node.departmentColor};flex-shrink:0;"></span>
        <span style="font-size:10px;color:var(--muted-foreground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${node.department}</span>
      </div>
    </div>
  `;
}

export function OrgChartCanvas({ data }: { data: OrgChartDatum[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<OrgChart<OrgChartDatum> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = chartRef.current ?? new OrgChart<OrgChartDatum>();
    chartRef.current = chart;

    chart
      .container(CONTAINER_SELECTOR)
      .data(data)
      .nodeId((d) => toDatum(d).id)
      .parentNodeId((d) => toDatum(d).parentId ?? undefined)
      .nodeWidth(() => 220)
      .nodeHeight(() => 92)
      .childrenMargin(() => 60)
      .siblingsMargin(() => 24)
      .svgWidth(container.clientWidth)
      .svgHeight(container.clientHeight)
      .nodeContent((d) => nodeContentHtml(d.data))
      .onNodeClick((d) => {
        router.push(`/org-chart?action=view&employeeId=${d.data.id}`, { scroll: false });
      })
      // CEO + department heads visible by default; each head's own reports
      // stay collapsed until "Expand all" — expanding the full ~50-person
      // tree up front leaves it so zoomed out it's unreadable.
      .initialExpandLevel(1)
      .render()
      .fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      chartRef.current?.svgWidth(container.clientWidth).svgHeight(container.clientHeight).render();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => chartRef.current?.collapseAll()}>
          Collapse all
        </Button>
        <Button variant="outline" size="sm" onClick={() => chartRef.current?.expandAll()}>
          Expand all
        </Button>
        <Button size="sm" onClick={() => chartRef.current?.fit()}>
          Fit to screen
        </Button>
      </div>
      <div id="org-chart-canvas-root" ref={containerRef} className="h-[680px] w-full overflow-hidden" />
    </div>
  );
}
