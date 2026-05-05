# Cycle 02 — Requirements

## Goal
Enhance the CS Manager dashboard with search, sort, improved filtering, mobile polish, and portfolio doc updates.

---

## Change Items

### Item 1: Search Input (Full-Text)

| Field | Detail |
|-------|--------|
| **File** | `index.html` + `app.js` + `style.css` |
| **Description** | Add a search input field above the inquiry grid (between filter-info and grid). Users can search by: `customer_label`, `product_name`, `message`, `ai_summary`, `draft_response`. The search is case-insensitive and live (filters as the user types). Integrate with `applyFilter()` so search + category filter work together. |
| **Completion Criteria** | 1. Search input `<input type="text" id="search-input" placeholder="검색어 입력...">` is rendered in the filter-info area. 2. Typing filters the visible cards by matching any of the 5 fields. 3. Clearing the input restores the full filtered set. 4. Works together with category/tab filters. |

### Item 2: Sort Controls

| Field | Detail |
|-------|--------|
| **File** | `index.html` + `app.js` + `style.css` |
| **Description** | Add a sort dropdown/button group next to the search input with 4 sort modes: ① **Newest** (`created_at` desc), ② **Priority high first** (`priority` → high > medium > low), ③ **Risk high first** (`risk_level` → critical > high > medium > low), ④ **Owner review first** (owner_review_required items first, then by priority). Sort applies on top of active filter + search. |
| **Completion Criteria** | 1. Sort selector (dropdown or button group) with 4 options. 2. Default sort = "최신순" (newest). 3. Changing sort re-orders the rendered cards instantly. 4. Sort works correctly with search + filter combined. |

### Item 3: Enhanced Risk Filter

| Field | Detail |
|-------|--------|
| **File** | `app.js` + `style.css` |
| **Description** | Replace the existing single "클레임 위험" filter with a multi-tier risk filter that shows sub-options: "전체 위험" (all risk), "🔴 치명 (critical)", "🔴 높음 (high)", "🟡 보통 (medium)", "🟢 낮음 (low)". Can be implemented as a sub-filter dropdown or expandable chip group below the main filter bar. Must visually indicate which risk tier is active. |
| **Completion Criteria** | 1. Risk filter expands to show individual risk levels. 2. Selecting a risk level filters inquiries by that specific `risk_level`. 3. "전체 위험" shows all non-low risk items (critical + high + medium). 4. Active risk level is visually highlighted. 5. Works with other category filters and search. |

### Item 4: 480px Mobile Optimization

| Field | Detail |
|-------|--------|
| **File** | `style.css` |
| **Description** | Upgrade the existing `@media (max-width: 480px)` breakpoint. Ensure: ① Filter bar buttons wrap cleanly without overflow. ② Search input fills 100% width. ③ Sort controls are compact (icon + label or single-line). ④ Inquiry cards use full width with adequate touch targets (min 44px tap area for buttons). ⑤ Hero stats use a stacked layout with adequate spacing. ⑥ Modal padding reduces to 16px. ⑦ Filter-info row stacks vertically (search above, sort below). |
| **Completion Criteria** | 1. No horizontal scroll at 480px viewport width. 2. All interactive elements have ≥ 44px tap targets. 3. Content is readable without zooming. 4. The dashboard remains fully functional. |

### Item 5: Reset Button Visual Enhancement

| Field | Detail |
|-------|--------|
| **File** | `style.css` (optionally `index.html` for icon) |
| **Description** | Upgrade the reset button (`#reset-filter`) from plain underlined text to a styled button with: ① Subtle background on hover. ② An icon (🔄 or SVG refresh). ③ Slightly larger tap target. ④ Active/pressed state feedback. ⑤ Positioned clearly next to the search input / filter controls. Consider merging it into the filter-info bar as a visual chip. |
| **Completion Criteria** | 1. Reset button is visually prominent but not distracting. 2. Has hover and active states. 3. Shows a refresh/reset icon. 4. Clicking it clears search text, resets sort to default, resets category filter to "all", and resets risk filter to "전체". 5. All filters return to initial state. |

### Item 6: Update Portfolio Docs

| Field | Detail |
|-------|--------|
| **File** | `PORTFOLIO_SUMMARY.md` + `README.md` |
| **Description** | Update the portfolio summary and README to reflect Cycle 02 additions: ① Add "🔍 검색 (고객명/상품명/내용)" to the 기능 table. ② Add "📊 정렬 (최신순/우선순위/위험도)" to the 기능 table. ③ Add "🚦 위험도 세부 필터 (치명/높음/보통/낮음)" to the 기능 table. ④ Update the "주요 기능" count from 6 to 9. ⑤ Bump version/tag references to `v0.2.0-cycle-02`. ⑥ Update README GitHub Pages link and deployment status if applicable. |
| **Completion Criteria** | 1. PORTFOLIO_SUMMARY.md has 9 features listed with Cycle 02 additions. 2. README.md references Cycle 02 version. 3. All doc changes are consistent and accurate. |

---

## Files to Modify Summary

| # | File | Changes |
|---|------|---------|
| 1 | `index.html` | Add search input, sort controls, risk filter UI elements |
| 2 | `app.js` | Add search logic, sort logic, enhanced risk filter logic, unified applyFilter() with all 3 combined |
| 3 | `style.css` | Search input styling, sort controls, risk filter chips, 480px breakpoint upgrade, reset button enhancement |
| 4 | `PORTFOLIO_SUMMARY.md` | Update feature list (6→9), bump version references |
| 5 | `README.md` | Update feature highlights, version/tag references |

## Non-Goals

- No changes to `data/sample_inquiries.json` schema
- No new HTML sections or pages
- No backend / API integration
- No GPT or real-time AI response generation
- No outputs/cycle-01/ file modifications

## Acceptance

All 6 items must be verifiable by:
1. Manual interaction in browser at 480px and desktop widths
2. Code review confirming search, sort, and risk filter logic correctness
3. Document review confirming PORTFOLIO_SUMMARY.md and README.md are updated
