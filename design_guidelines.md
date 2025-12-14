# Repository Mirror AI - Design Guidelines

## Design Approach
**Reference-Based:** Modern developer tool aesthetic inspired by Linear, Vercel, and GitHub's interface paradigms. Focus on clarity, data hierarchy, and progressive disclosure of complex information.

## Typography System
- **Primary Font:** Inter (Google Fonts) for UI elements
- **Monospace Font:** JetBrains Mono for code snippets and repo names
- **Hierarchy:**
  - Hero headline: text-5xl font-bold
  - Section headers: text-3xl font-semibold
  - Score display: text-6xl font-bold (large numerical prominence)
  - Body text: text-base
  - Labels/metadata: text-sm text-gray-600

## Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 12, 16, and 24 for consistent rhythm
- Component padding: p-8 to p-12
- Section spacing: space-y-8 to space-y-16
- Card spacing: gap-6 to gap-8

**Container Strategy:**
- Main container: max-w-4xl mx-auto for focused content
- Input section: max-w-2xl centered
- Results grid: Uses full container width with appropriate gaps

## Page Structure

**Hero Section (40vh):**
- Centered layout with gradient background treatment
- Large headline explaining the tool's value proposition
- Subheading with quick feature bullets
- GitHub URL input prominently displayed with inline submit button
- Input uses monospace font for technical context
- No hero image - keep focus on the input interface

**Analysis Display Section:**
Full-width content area revealing after submission:

**Score Card (Primary Focus):**
- Large circular or semi-circular progress indicator
- Numerical score prominently displayed (text-6xl)
- Skill level badge positioned near score
- Use radial gradient background for visual interest
- Compact vertical layout: max height 300px

**Information Grid (2-column on desktop, stack on mobile):**
- Left Column: Repository Metadata Card
  - Repo name with monospace font
  - File/folder counts with icons
  - Languages detected (pill badges)
  - Commit statistics
  - Compact spacing (space-y-2)
  
- Right Column: Analysis Summary Card
  - LLM-generated summary in readable prose
  - Key metrics highlighted inline
  - Standard text width for readability

**Roadmap Section:**
- Full-width card below grid
- Numbered list items with generous spacing (space-y-4)
- Each item includes icon + action text
- Checkbox-style indicators suggesting actionable items
- Expandable details for complex suggestions

**Radar Chart Visualization:**
- Positioned below roadmap
- Dimensions: Code Quality, Documentation, Testing, Activity, Structure
- Compact size (400px × 400px max)
- Clear axis labels with monospace font

## Component Library

**Input Component:**
- Large text input (h-14) with rounded-lg borders
- Monospace font for URL entry
- Inline submit button (right-aligned, integrated)
- Focus states with border emphasis
- Error states with inline validation messages

**Cards:**
- Rounded corners: rounded-xl
- Padding: p-8
- Subtle border treatment
- Distinct elevation through border weight, not shadows

**Buttons:**
- Primary CTA: Large (h-12), full rounded-full, medium weight text
- Secondary actions: Ghost style with border
- Icon buttons for theme toggle (top-right corner)

**Loading States:**
- Skeleton loaders matching content structure
- Pulsing animation for score calculation
- Progress bar showing analysis stages

**Badges/Pills:**
- Skill level: Large (px-6 py-2), bold text, rounded-full
- Language tags: Small (px-3 py-1), rounded-md
- Metrics: Icon + number in compact layout

**Icons:**
- Use Heroicons exclusively via CDN
- Sizes: 20px (inline), 24px (standalone), 32px (features)

## Interaction Patterns

**Form Submission Flow:**
1. User enters URL
2. Input validates and shows feedback
3. Submit triggers loading state
4. Score section animates in first (stagger: 200ms)
5. Grid and roadmap fade in sequentially (stagger: 300ms)
6. Radar chart draws with animation

**Theme Toggle:**
- Positioned in top-right header
- Sun/moon icon transition
- Smooth property transitions (duration-300)

## Responsive Behavior
- Mobile (< 768px): Single column, stack all cards, input full width
- Tablet (768px - 1024px): Maintain 2-column grid for metadata/summary
- Desktop (> 1024px): Full layout as described

## Data Visualization
**Numerical Emphasis:**
- Large score display dominates visual hierarchy
- Supporting metrics use tabular layout (2-column grid)
- Percentage/count values aligned right
- Labels aligned left with consistent width

**Radar Chart Specifics:**
- Pentagon/hexagon shape for 5-6 dimensions
- Semi-transparent fill
- Clear axis labels outside perimeter
- Legend below chart if needed

## Accessibility
- ARIA labels for score indicators
- Keyboard navigation for form submission
- Focus indicators on all interactive elements
- Sufficient contrast for all text (WCAG AA minimum)
- Screen reader announcements for loading states

## Performance Considerations
- Lazy load radar chart library
- Optimize icon loading (single sprite or font)
- Debounce URL input validation
- Progressive disclosure of analysis results