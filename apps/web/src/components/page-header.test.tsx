import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the page title as the h1 with description and actions", () => {
    render(<PageHeader title="Employees" description="Manage your team" actions={<button type="button">Add</button>} />);
    expect(screen.getByRole("heading", { level: 1, name: "Employees" })).toBeInTheDocument();
    expect(screen.getByText("Manage your team")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
