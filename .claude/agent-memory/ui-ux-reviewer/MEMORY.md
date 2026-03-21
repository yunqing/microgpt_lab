# UI/UX Reviewer Memory - MicroGPT Lab

## Project Overview
Educational web app teaching GPT architecture through 10 interactive levels. Each level has visualization components with user controls (sliders, buttons, inputs).

## Design System
- **Color Scheme**: Deep sea theme (slate/cyan/indigo base)
- **Framework**: React + Tailwind CSS + Framer Motion
- **Responsive**: Mobile-first with tab-based navigation on mobile
- **Typography**: Monospace for code/values, sans-serif for text
- **Interactions**: Hover states, animations, smooth transitions

## Interactive Patterns Observed
1. **Number inputs**: Used in Level 2 (Autograd) - need validation for NaN
2. **Range sliders**: Levels 3, 6, 8, 10 - all working correctly
3. **Buttons**: Preset buttons, action buttons (Play/Pause), sample buttons
4. **Token selectors**: Grid-based selectors (Level 1, 3, 8)
5. **Animated visualizations**: SVG, bar charts, heatmaps

## Common UI Conventions
- Cyan = primary accent, active state
- Orange/yellow = gradients, secondary data
- Red = negative values, loss
- Purple = BOS token
- Small text (text-xs) for labels
- Border-radius: rounded-lg, rounded-xl

## Key Files
- `/src/visualizations/[Name]Viz.jsx` - 10 visualization components
- `/src/components/VisualizationPanel.jsx` - container wrapper
- `/src/index.css` - mobile touch target rules (min 44x44px)

## Known Issues Fixed
- Level 4 (RMSNorm): Recently fixed
- Level 9 (Adam): Recently fixed

## Accessibility Notes
- Mobile touch targets enforced via CSS (44x44px minimum)
- Keyboard navigation needs review
- ARIA attributes present in main app navigation
- Color contrast generally good (cyan on dark slate)
