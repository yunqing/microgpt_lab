# Screenshot Guide

This guide will help you capture screenshots for the README.

## Recommended Screenshots

### 1. Desktop - Main Interface
**Filename:** `screenshots/desktop-main.png`
- Open https://yunqing.github.io/microgpt_lab/ on desktop
- Show Level 1 or 2 with both panels visible
- Full window capture (1920x1080 or similar)
- Shows: sidebar, visualization, content panel

### 2. Desktop - Attention Visualization
**Filename:** `screenshots/desktop-attention.png`
- Navigate to Level 6 (Attention)
- Show the attention weights visualization
- Capture the interactive elements

### 3. Mobile - Content View
**Filename:** `screenshots/mobile-content.png`
- Open site on mobile or use browser dev tools (iPhone 12 size)
- Show the "Content" tab active
- Portrait orientation
- Shows: header, navigation button, content

### 4. Mobile - Visualization View
**Filename:** `screenshots/mobile-viz.png`
- Same mobile view
- Switch to "Visualization" tab
- Shows the tab switcher and visualization

### 5. Desktop - Code Panel
**Filename:** `screenshots/desktop-code.png`
- Show a level with code panel expanded
- Highlight the syntax highlighting and line numbers

## How to Take Screenshots

### On macOS
```bash
# Full screen
Cmd + Shift + 3

# Selection
Cmd + Shift + 4

# Window
Cmd + Shift + 4, then press Space, then click window
```

### Using Browser DevTools (for mobile)
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (or Cmd+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Take screenshot: Click ⋮ (three dots) → "Capture screenshot"

### Using Browser Extensions
- **Awesome Screenshot** (Chrome/Firefox)
- **Fireshot** (Chrome/Firefox)
- **Nimbus Screenshot** (Chrome)

## After Taking Screenshots

1. Save screenshots to `/screenshots/` directory
2. Optimize images (use ImageOptim or similar)
3. Update README.md with image links:

```markdown
## 📸 Screenshots

### Desktop View
![Desktop Main Interface](screenshots/desktop-main.png)
*Split-screen layout with interactive visualizations and detailed explanations*

![Attention Mechanism](screenshots/desktop-attention.png)
*Level 6: Interactive attention weight visualization*

### Mobile View
<p float="left">
  <img src="screenshots/mobile-content.png" width="300" />
  <img src="screenshots/mobile-viz.png" width="300" />
</p>
*Mobile-optimized interface with tab-based navigation*
```

## Recommended Image Sizes

- Desktop screenshots: 1920x1080 or 1440x900
- Mobile screenshots: 375x812 (iPhone 12 size)
- Compress to < 500KB per image for fast loading

## Optional: Animated GIFs

For showing interactions:
1. Use **LICEcap** (macOS/Windows) or **Kap** (macOS)
2. Record short interactions (5-10 seconds)
3. Keep file size < 2MB
4. Examples:
   - Switching between levels
   - Adjusting visualization parameters
   - Mobile tab switching
