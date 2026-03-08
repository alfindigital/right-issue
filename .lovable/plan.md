

## UI/UX Redesign Plan — Modern, Interactive, Simple, Mobile-First

### Current State
The app uses stacked card sections with a flat blue header, standard form inputs, and basic tab navigation. While functional, it looks like a traditional form rather than a modern interactive tool.

---

### Priority 1: Header & Branding Overhaul
**Problem:** Plain blue bar with small icons, no visual identity.
**Solution:**
- Gradient header with subtle animated mesh/grain texture
- Larger logo area with app icon + tagline ("Simulasi Right Issue Cepat & Akurat")
- Floating pill-style toolbar for theme/language/history/embed (grouped with glassmorphism background)
- On mobile: compact header with collapsible action menu (hamburger → bottom sheet)

### Priority 2: Stepper/Wizard Flow (Replace Flat Form)
**Problem:** All inputs shown at once — overwhelming, especially on mobile.
**Solution:**
- Replace the single-page calculator form with a **multi-step wizard**:
  - Step 1: Kode Saham + Info RI (rasio, harga)
  - Step 2: Kepemilikan (lot, avg price)
  - Step 3: Opsi Waran (conditional)
  - Step 4: Hasil & Analisis
- Progress indicator bar at top (numbered dots or segmented progress bar)
- Smooth slide/fade transitions between steps
- "Lanjut" / "Kembali" buttons with keyboard support
- On mobile: full-width steps, swipe gesture support
- **Keep "Advanced mode"** toggle to show all fields at once for power users

### Priority 3: Results Dashboard Redesign
**Problem:** Results are plain text rows — no visual hierarchy or delight.
**Solution:**
- **Hero metric card** at top: Final Avg Price with large animated number + comparison badge (vs TERP)
- **Stat grid** (2x2 on mobile, 4-col on desktop): Total Lot, Total Value, TERP, Discount/Premium — each in a mini card with icon + colored accent
- Recommendation as a prominent **banner card** with icon (checkmark/warning), not just text
- Animate numbers counting up on first render
- Subtle confetti or success pulse animation when results are positive

### Priority 4: Bottom Navigation (Mobile)
**Problem:** Top tabs are hard to reach on tall phones.
**Solution:**
- On mobile (< 768px), replace top `TabsList` with a **fixed bottom navigation bar**
- 3 items: Kalkulator (calculator icon), Budget (wallet icon), Edukasi (book icon)
- Active tab highlighted with filled icon + label
- Top tabs remain on desktop

### Priority 5: Card Visual Refresh
**Problem:** Cards look uniform with no depth variation.
**Solution:**
- Add subtle **left border accent** (colored by section type: blue for input, green for results, purple for analysis)
- Section headers with icon + badge count (e.g., "Analisis Lanjutan" with "3 insights" badge)
- Collapsible sections with smooth accordion animation (for advanced analysis, dilution sim, what-if)
- Hover micro-interactions: gentle lift + shadow increase

### Priority 6: Input Fields Polish
**Problem:** Inputs are functional but plain.
**Solution:**
- Floating labels (label animates up when focused/filled)
- Input prefix for currency fields (Rp inside the field, left-aligned)
- Ratio input as a visual "X : Y" component with colon separator styled prominently
- Success checkmark appears when field is valid
- Inline validation with colored border (red error, green valid)

### Priority 7: Interactive Charts Upgrade
**Problem:** Charts are basic recharts with default styling.
**Solution:**
- Custom color palette matching the app theme
- Donut charts with center label showing key metric
- Hover tooltips with formatted values
- Chart section tabs (slide between different visualizations)
- On mobile: horizontal scroll for comparison charts

---

### Technical Approach
- All changes use existing stack: Tailwind CSS, shadcn/ui, Recharts, Framer-less CSS animations
- No new dependencies needed (CSS transitions + Tailwind keyframes for animations)
- Mobile responsiveness via existing Tailwind breakpoints + `useIsMobile` hook
- Wizard state managed with a simple `currentStep` state variable
- Bottom nav conditionally rendered based on `useIsMobile()`

### Files to Modify
- `src/components/RightIssueCalculator/index.tsx` — Wizard flow, bottom nav, layout restructure
- `src/index.css` — New component classes, animation keyframes, floating label styles
- `tailwind.config.ts` — Additional keyframes if needed
- New: `src/components/RightIssueCalculator/StepWizard.tsx` — Step container component
- New: `src/components/RightIssueCalculator/BottomNav.tsx` — Mobile bottom navigation
- New: `src/components/RightIssueCalculator/ResultsDashboard.tsx` — Redesigned results display
- New: `src/components/RightIssueCalculator/StatCard.tsx` — Mini metric card component
- Modify existing section components for accordion/collapsible behavior

