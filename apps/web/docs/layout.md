# WorkSphere — Layout Positions

## Global shell
- Left sidebar, fixed 244px, full viewport height, sticky.
  - Top: logo mark + wordmark.
  - Below: vertical nav list (Dashboard, Directory, Org Chart, My Profile, Change Password — role-filtered).
  - Spacer fills remaining height.
  - Bottom: user footer row — avatar chip (left), name + role badge stacked (center), logout icon (right).
- Right of sidebar: content column, fills remaining width.
- Mobile (<860px): sidebar removed. Top bar = logo (left) + avatar (right). Bottom = fixed tab bar, 3 equal-width tabs (Dashboard / Directory / Profile), icon over label.

## 1. Login
- Full-viewport, centered card (~420px wide), nothing else on screen.
- Inside card, top to bottom: logo mark + wordmark row, headline, subheadline, email field, password field, full-width primary button, small footnote text.
- Forced-password-change state replaces the whole card content: headline, notice banner, current-password field, new-password field, full-width primary button.

## 2. Dashboard
- Page header row: greeting text (left).
- Row of 4 stat cards, equal width, side by side (stack to 1 column on mobile). Each card: icon top-left, big number below it, label under the number.
- Below stat row: 2 cards side by side (stack on mobile).
  - Left card: "Department Breakdown" — list of rows, each row = label + count on one line, progress bar underneath.
  - Right card: "Recently Joined" — list of rows, each row = avatar chip (left), name + designation (middle, stacked), date (right).
- Employee-role dashboard (no stat cards): 3 small cards side by side (Department / Time at Company / Reporting Manager), then one wide card below with two buttons side by side (View My Profile, Change Password).

## 3. Directory
- Header row: title + count (left), "Add Employee" button (right, hidden for Employee role).
- Toolbar card below header: search field (left, expands), then 3 filter dropdowns in a row to its right (Department, Role, Status).
- Table card below toolbar (desktop): header row of column labels, then one row per employee — avatar+name+email (left, wide), Department, Designation, Status pill, Reporting Manager, ⋮ menu icon (far right). Row is clickable.
- Mobile: table becomes a vertical stack of cards — avatar (left), name+designation/department (middle), status pill (right).

## 4. Employee Profile
- Two columns side by side (stack on mobile, photo card on top).
  - Left column (narrow, ~300px): avatar (centered, top), name, designation, employee ID, role badge — all centered, stacked. Below: two full-width buttons stacked (Edit Profile, Change Password).
  - Right column (wide): "Profile Details" card — fields in a 2-column grid (Email/Phone, Department/Designation, Salary/Joining Date, Status/Reporting Manager). Below that card: "Direct Reports" section — grid of small cards (avatar + name/designation), wraps to multiple per row.

## 5. Add / Edit Employee Form
- Header row: title (left).
- Tab row below header: Basic Info | Job Details | Reporting Structure, left-aligned, underline on active tab.
- One card below tabs (~720px wide) whose content swaps per tab:
  - Basic Info: Full Name (full width), then Email + Phone side by side, then System Role dropdown + Temporary Password field side by side (password field only in add mode).
  - Job Details: Department + Designation side by side, then Status + Joining Date side by side, then Salary field (full width).
  - Reporting Structure: single search field for manager (full width), dropdown results list appears below it when typing; once picked, shows a manager summary chip with a "Change" link.
- Below the card: two buttons side by side (Save Employee, Cancel).

## 6. Org Chart
- One large full-width card containing the tree, horizontally scrollable.
- Root node centered at top.
- Its children rendered in a row directly below it, connected by lines, centered as a group.
- Each child's own children (if expanded) render in a row below that child, same pattern, recursively — tree grows downward and outward.
- Every node card is clickable to expand/collapse its own children.

## 7. Change Password
- Single centered card (~440px wide).
- Top to bottom inside card: Current Password field, New Password field (strength bar directly under it), Confirm Password field, full-width Update Password button.
- Success state replaces card content: centered checkmark icon, headline, confirmation line underneath.

## Breakpoint
Layout switches from desktop (sidebar + table) to mobile (top bar + bottom tabs + stacked cards) under 860px viewport width.
