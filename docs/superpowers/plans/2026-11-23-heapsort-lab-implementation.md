# Heap Sort Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, and publish a responsive Heap Sort learning website that visibly extracts each maximum correctly, compares Heap Sort with Bubble Sort, and includes a detailed reflection.

**Architecture:** A dependency-free static site separates the pure Heap Sort step generator from DOM rendering. The algorithm module returns immutable snapshots consumed by the UI, making correctness testable with Node’s built-in test runner while the browser layer handles SVG rendering, controls, animation, and responsive presentation.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, SVG, Node.js built-in test runner, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-11-23-heapsort-design.md`

## Global Constraints

- Accept 2–12 integers, including negative and duplicate values; separators may be commas, Chinese commas, or whitespace.
- Use no runtime framework, package, CDN, or external library.
- Final order must be ascending; every extraction must place the current heap maximum into the sorted region.
- Explain Heap Sort as O(n log n) in best, average, and worst cases; optimized Bubble Sort as O(n) best and O(n²) average/worst.
- Keep the site in Traditional Chinese and deploy it as a public GitHub Pages site.
- Do not copy the reference page’s layout or prose.

## Review Focus

- Duplicate values must remain present and correctly sorted; pin this in Task 2’s algorithm tests.
- Negative and zero values must compare numerically; pin this in Task 2’s parsing and sorting tests.
- Starting auto-play twice must not create two timers; pin behavior in Task 4’s controller design and browser test.
- Changing data after partial playback must reset history, counters, and sorted-zone state; verify in Task 4’s browser test.
- Mobile widths must not clip the array, controls, table, or SVG tree; verify at 390 px in Task 5.

---

### Task 1: Visual Concept and Design Tokens

**Files:**
- Create: `assets/heapsort-lab-concept.png`
- Create: `docs/visual-fidelity-ledger.md`

**Interfaces:**
- Consumes: the visual direction and page structure from the approved spec.
- Produces: a user-approved complete-page concept and a token list for Task 3.

- [ ] **Step 1: Generate a complete desktop concept**

Use the image generation workflow to create a readable full-page “algorithm laboratory” design covering the hero, interactive visualizer, explanation, comparison, and reflection sections.

- [ ] **Step 2: Inspect the generated concept**

Use `view_image` and verify the required sections, dark navy palette, cyan/amber/green states, readable Traditional Chinese hierarchy, and responsive-friendly container model.

- [ ] **Step 3: Record design tokens and comparison points**

Create `docs/visual-fidelity-ledger.md` with exact palette roles, type families, radii, spacing, container width, node treatment, and at least five future comparison points.

- [ ] **Step 4: Obtain concept approval**

Show the concept to the user and pause implementation until it is accepted.

### Task 2: Tested Heap Sort Step Engine

**Files:**
- Create: `package.json`
- Create: `src/heap-sort.js`
- Create: `tests/heap-sort.test.js`

**Interfaces:**
- Produces: `parseIntegerList(text: string): {ok: true, values: number[]} | {ok: false, error: string}`.
- Produces: `generateHeapSortSteps(values: number[]): {steps: Step[], result: number[], extractedMaxima: number[]}` where `Step` contains `array`, `heapSize`, `phase`, `message`, `compareIndices`, `swapIndices`, `comparisons`, `swaps`, and `extractedMaxima`.
- Produces: `isMaxHeap(values: number[], heapSize: number): boolean` for tests and UI status.

- [ ] **Step 1: Write failing parser tests**

Test comma/Chinese-comma/whitespace parsing, negative numbers and zero, non-numeric tokens, fewer than 2 values, and more than 12 values.

- [ ] **Step 2: Run parser tests and verify failure**

Run: `node --test tests/heap-sort.test.js`
Expected: FAIL because `src/heap-sort.js` does not exist.

- [ ] **Step 3: Implement `parseIntegerList`**

Return exact Traditional Chinese validation messages and never silently discard invalid tokens.

- [ ] **Step 4: Run parser tests and verify pass**

Run: `node --test tests/heap-sort.test.js`
Expected: parser tests PASS.

- [ ] **Step 5: Add failing algorithm tests**

Assert correct results for `[4,10,3,5,1]`, already sorted, reverse sorted, duplicates, negatives/zero, and two elements. For every extraction snapshot, assert the newly sorted value equals the maximum of the previous heap region; assert the final multiset equals the input multiset.

- [ ] **Step 6: Run algorithm tests and verify failure**

Run: `node --test tests/heap-sort.test.js`
Expected: FAIL because the generator and heap validator are incomplete.

- [ ] **Step 7: Implement `generateHeapSortSteps` and `isMaxHeap`**

Generate immutable snapshots for initial, build, compare, swap, extract, sift-down, and complete phases. Build from `Math.floor(n / 2) - 1`, then exchange index 0 with each `end` from `n - 1` through `1`.

- [ ] **Step 8: Run all engine tests**

Run: `node --test tests/heap-sort.test.js`
Expected: all tests PASS.

- [ ] **Step 9: Commit the engine**

```bash
git add package.json src/heap-sort.js tests/heap-sort.test.js
git commit -m "feat: add tested heap sort step engine"
```

### Task 3: Responsive Page and Educational Content

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `src/app.js`
- Modify: `docs/visual-fidelity-ledger.md`

**Interfaces:**
- Consumes: Task 1 design tokens and Task 2 module exports.
- Produces: DOM IDs `data-input`, `apply-data`, `random-data`, `reset-sort`, `prev-step`, `next-step`, `auto-play`, `heap-tree`, `array-view`, `step-message`, `comparison-count`, `swap-count`, `heap-size`, `extracted-values`, and `history-list` for Task 4.

- [ ] **Step 1: Create semantic page content**

Build the hero, visualizer, principle, JavaScript algorithm, complexity comparison, growth comparison, and 4–6 paragraph first-person reflection sections using the approved copy requirements.

- [ ] **Step 2: Implement the accepted design system**

Define CSS custom properties for the approved palette, typography, spacing, radii, shadows, states, and 1120 px content container. Add responsive layouts for desktop and widths down to 390 px; preserve 16 px minimum body text.

- [ ] **Step 3: Add static source checks**

Create tests in `tests/site-content.test.js` that read `index.html` and assert all required DOM IDs, section headings, complexity values, stability statements, and reflection section are present.

- [ ] **Step 4: Run static source checks**

Run: `node --test tests/site-content.test.js`
Expected: PASS.

- [ ] **Step 5: Commit the page shell**

```bash
git add index.html styles.css src/app.js tests/site-content.test.js docs/visual-fidelity-ledger.md
git commit -m "feat: build heap sort learning interface"
```

### Task 4: Interactive Renderer and Controls

**Files:**
- Modify: `src/app.js`
- Modify: `styles.css`
- Modify: `tests/heap-sort.test.js`

**Interfaces:**
- Consumes: `generateHeapSortSteps`, `parseIntegerList`, `isMaxHeap`, and Task 3 DOM IDs.
- Produces: `renderStep(index: number): void`, `loadValues(values: number[]): void`, `startAutoPlay(): void`, `stopAutoPlay(): void`, and responsive SVG tree rendering.

- [ ] **Step 1: Implement state loading and step navigation**

`loadValues` regenerates snapshots and resets index/timer; previous/next buttons clamp to valid indices and update disabled states.

- [ ] **Step 2: Implement array and tree rendering**

Render array indices, heap/sorted boundary, compare/swap classes, SVG parent-child edges, nodes, and current heap validity without mutating snapshots.

- [ ] **Step 3: Implement counters, extraction history, and messages**

Show comparison/swap totals, heap size, ordered extracted maxima, phase label, progress, and a completion announcement.

- [ ] **Step 4: Implement controls and keyboard-safe auto-play**

Apply custom input, randomize, reset, previous, next, and a single 850 ms auto-play timer that changes to pause state and stops at completion or on data changes.

- [ ] **Step 5: Run all automated tests**

Run: `node --test`
Expected: all tests PASS.

- [ ] **Step 6: Commit interactions**

```bash
git add src/app.js styles.css tests/heap-sort.test.js
git commit -m "feat: add interactive heap sort visualization"
```

### Task 5: Browser QA, Fidelity Review, and Documentation

**Files:**
- Create: `README.md`
- Modify: `docs/visual-fidelity-ledger.md`

**Interfaces:**
- Consumes: the complete static site and accepted concept.
- Produces: verified desktop/mobile experience and project documentation ready for publishing.

- [ ] **Step 1: Start a local static server**

Run the existing approved local server mechanism from the repository root and open the page in the Browser/IAB. If browser access is unavailable, document the blocker and use the available local screenshot fallback.

- [ ] **Step 2: Verify the core workflow in browser**

Use `[4,10,3,5,1]`, click through every extraction, and confirm the visible extracted sequence is `10, 5, 4, 3`, the final result is `1, 3, 4, 5, 10`, auto-play uses one timer, and changing data resets state.

- [ ] **Step 3: Verify edge cases in browser**

Check duplicates, negatives/zero, two values, invalid input, already sorted input, and random data.

- [ ] **Step 4: Verify responsive layouts**

Inspect desktop and 390 px mobile views for overflow, clipped controls, table scrolling, SVG scaling, readable labels, and touch-sized controls.

- [ ] **Step 5: Perform visual fidelity comparison**

Capture the latest desktop implementation screenshot and use `view_image` on both the accepted concept and implementation. Update the ledger with evidence for copy, layout, typography, palette/states, spacing/container, responsive behavior, fixes, and any intentional deviations.

- [ ] **Step 6: Write README**

Document purpose, features, algorithm, complexity comparison, local usage, tests, project structure, and GitHub Pages URL placeholder.

- [ ] **Step 7: Run final verification**

Run: `node --test`
Expected: all tests PASS with no skipped tests.

- [ ] **Step 8: Commit QA documentation**

```bash
git add README.md docs/visual-fidelity-ledger.md
git commit -m "docs: add verification and project guide"
```

### Task 6: GitHub Repository and Pages Deployment

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: the verified repository from Task 5.
- Produces: a public GitHub repository and reachable GitHub Pages URL.

- [ ] **Step 1: Inspect Git and GitHub authentication**

Run read-only checks for repository status, `gh` availability, authenticated account, and existing remote. Never print credentials.

- [ ] **Step 2: Create and push the public repository**

Default repository name: `heapsort-lab`. Initialize Git only if needed, use branch `main`, create the public GitHub repository under the authenticated account, and push committed source.

- [ ] **Step 3: Enable GitHub Pages**

Configure Pages to publish from the `main` branch root, then wait for the deployment to reach a terminal success state.

- [ ] **Step 4: Verify the deployed URL**

Open the literal Pages URL and repeat the default dataset’s full sorting workflow. Confirm assets load over HTTPS and no console-visible failure prevents interaction.

- [ ] **Step 5: Add the live URL to README and push**

Update `README.md` with the final URL, commit as `docs: add live demo link`, push, and verify the update is reflected in the repository.

## Self-Review Result

- Spec coverage: every design-spec section maps to Tasks 1–6; no gaps found.
- Step scan: each step has one deliverable or checkable action; algorithm bodies are intentionally left to implementation.
- Type consistency: Task 2 exports exactly the functions consumed by Tasks 3–4.
- Review Focus: all five listed failure modes have an owning automated or browser verification step.
- Proportion: six tasks cover concept, algorithm, page, interaction, QA, and deployment without duplicating implementation code.
