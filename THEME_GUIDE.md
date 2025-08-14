# 🎨 Complete Theme Documentation - ChatGPT PromptEngineer Extension

## 📚 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [CSS Variables Reference](#css-variables-reference)
4. [Component Selectors Guide](#component-selectors-guide)
5. [Creating Custom Themes](#creating-custom-themes)
6. [Testing & Validation](#testing--validation)

---

## 🏗️ Architecture Overview

The extension uses a **3-layer CSS architecture** for maximum flexibility:

```
styles/
├── base.css       # Structure & Layout (DO NOT EDIT)
├── theme.css      # Colors & Visual Design (SAFE TO EDIT)
└── animations.css # Transitions & Motion (EDIT WITH CARE)
```

### Design Principles:
- **Separation of Concerns**: Structure, Theme, and Behavior are isolated
- **CSS Variables**: All colors and values use CSS custom properties
- **Cascade Order**: Base → Theme → Animations (loaded in this order)
- **No !important**: Clean specificity hierarchy

---

## 📁 File Structure

### Files You Can Safely Edit:
- ✅ `styles/theme.css` - All visual theming
- ⚠️ `styles/animations.css` - Animation timings only
- ❌ `styles/base.css` - Never edit (breaks functionality)

---

## 🎨 CSS Variables Reference

### Color System

```css
/* Primary Brand Colors */
--color-primary: #016bff;           /* Main accent color */
--color-primary-hover: #0056cc;     /* Hover state */
--color-primary-light: #4a9eff;     /* Light variant */
--color-primary-dark: #1e7ce8;      /* Dark variant */

/* Background Colors */
--color-background-main: #282828;      /* Container background */
--color-background-secondary: #424242;  /* Secondary backgrounds */
--color-background-tertiary: #4a4a4a;  /* Tertiary backgrounds */
--color-surface: #424242;              /* Input/button surfaces */
--color-surface-hover: #4a4a4a;        /* Hover state surfaces */

/* Text Colors */
--color-text-primary: #f0f0f0;      /* Main text */
--color-text-secondary: #c9c9c9;    /* Labels, secondary text */
--color-text-muted: #a49f9f;        /* Disabled, muted text */
--color-text-placeholder: #a49f9f;   /* Input placeholders */

/* Border Colors */
--color-border-default: #282828;    /* Default borders */
--color-border-accent: #1776d969;   /* Accent borders */
--color-border-focus: #016bff;      /* Focus state borders */

/* Status Colors */
--color-success: #4caf50;           /* Success states */
--color-warning: #ff9800;           /* Warning states */
--color-error: #f44336;             /* Error states */
```

### Typography System

```css
/* Font Families */
--font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Font Sizes */
--font-size-xs: 11px;    /* Smallest text */
--font-size-sm: 12px;    /* Small text */
--font-size-base: 14px;  /* Default text */
--font-size-lg: 16px;    /* Large text */
--font-size-xl: 18px;    /* Extra large */
--font-size-xxl: 20px;   /* Largest text */

/* Font Weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-bold: 600;
```

### Spacing System

```css
/* Consistent spacing scale */
--spacing-xs: 3px;      /* Minimal spacing */
--spacing-sm: 5px;      /* Small spacing */
--spacing-md: 10px;     /* Medium spacing */
--spacing-lg: 15px;     /* Large spacing */
--spacing-xl: 20px;     /* Extra large */
--spacing-xxl: 30px;    /* Maximum spacing */
```

### Other Design Tokens

```css
/* Border Radius */
--radius-small: 6px;    /* Small elements */
--radius-medium: 8px;   /* Default radius */
--radius-large: 12px;   /* Large elements */

/* Shadows */
--shadow-small: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.3);
--shadow-large: 0 -5px 20px rgba(0, 0, 0, 0.3);
--shadow-glow: 0 0 5px #016bff;
--shadow-glow-intense: 0 0 15px var(--color-primary);
--shadow-focus: inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 119, 255, 0.6);
```

---

## 🔍 Component Selectors Guide

### Main Container

#### `#prompt-generator-container`
**Purpose**: Main floating panel that slides up from bottom
**Themeable Properties**:
- `background-color` - Panel background
- `color` - Default text color
- `border` - Panel border
- `box-shadow` - Drop shadow effect

**HTML Structure**:
```html
<div id="prompt-generator-container">
  <!-- All UI elements -->
</div>
```

**States**:
- `.hidden` - Panel is hidden (slides down)
- `:not(.hidden)` - Panel is visible

---

### Top Bar Components

#### `.extension-topbar`
**Purpose**: Header bar with logo and controls
**Themeable Properties**:
- `border-bottom` - Separator line

#### `.extension-logo`
**Purpose**: Container for extension logo
**Children**:
- `img` - Logo image (20px height)

#### `.extension-controls`
**Purpose**: Container for language selector and settings
**Layout**: Flexbox with 15px gap

#### `#language-selector`
**Purpose**: Language dropdown selector
**Themeable Properties**:
- `background` - Dropdown background
- `color` - Text color
- `border` - Border styling
- `:hover` - Hover state border

#### `#settings-icon`
**Purpose**: Settings gear icon
**Themeable Properties**:
- `opacity` - Default transparency
- `:hover` - Rotation animation + opacity
- `svg fill` - Icon color

---

### Form Elements

#### `.prompt-generator-dropdown`
**Purpose**: All dropdown select elements
**Themeable Properties**:
- `background-color` - Dropdown background
- `border` - Border styling
- `color` - Text color
- `:hover/:focus` - Focus state border

**Special Styling**:
- `option:first-child` - Placeholder option color

#### `.prompt-generator-dropdown-wrapper`
**Purpose**: Container for each dropdown
**Layout**: 33.33% width (3 columns)

#### `.prompt-generator-input`
**Purpose**: Text input fields
**Themeable Properties**:
- `background-color` - Input background
- `color` - Text color
- `border` - Border styling
- `::placeholder` - Placeholder text color

#### `#PromptInput`
**Purpose**: Main combined prompt textarea
**Themeable Properties**:
- Same as `.prompt-generator-input`
- `:focus` - Enhanced focus state with glow

---

### Checkbox System

#### `.prompt-generator-checkbox-container`
**Purpose**: Container for all checkboxes
**Layout**: Flexbox, center-aligned, wrapping

#### `.checkbox_btn`
**Purpose**: Custom checkbox button styling
**Themeable Properties**:
- `background-color` - Button background
- `border` - Border styling
- `color` - Text color
- `:hover` - Hover border color
- `.active` - Selected state (uses primary color)

**HTML Structure**:
```html
<label class="checkbox_btn">
  Text Label
  <input type="checkbox" hidden>
</label>
```

---

### Settings Panel

#### `#settings-panel`
**Purpose**: Overlay panel for settings
**Themeable Properties**:
- `background` - Overlay background (rgba)
**States**:
- `.show` - Panel is visible

#### `.settings-content`
**Purpose**: Settings modal container
**Themeable Properties**:
- `background` - Modal background
- `border` - Modal border

#### `.setting-item`
**Purpose**: Individual setting option
**Themeable Properties**:
- `background` - Item background
- `border` - Item border
- `:hover` - Hover border color

---

### Utility Classes

#### `.prompt-generator-title`
**Purpose**: Section titles
**Themeable Properties**:
- `color` - Title color

#### `.prompt-generator-subtitle`
**Purpose**: Small uppercase labels
**Themeable Properties**:
- `color` - Subtitle color
- `text-transform: uppercase` - Always uppercase

#### `.prompt-generator-attribution`
**Purpose**: Footer attribution text
**Themeable Properties**:
- `color` - Attribution text color

---

### Special Elements

#### `.toggle-button`
**Purpose**: Floating on/off button (bottom-right)
**Themeable Properties**:
- `box-shadow` - Button shadow
- `:hover` - Hover glow effect
**States**:
- `.rotated` - Button is rotated 180°

#### `.prompt-highlight`
**Purpose**: Highlighted prompt terms
**Themeable Properties**:
- `color` - Highlight color
- `background` - Highlight background
- `font-weight` - Bold text
**Variants**:
- `.even` - Even numbered highlights
- `.odd` - Odd numbered highlights

---

## 🎨 Creating Custom Themes

### Theme Template

```css
/* My Custom Theme */
:root {
  /* Brand Colors */
  --color-primary: #your-color;
  --color-primary-hover: #your-hover;
  
  /* Backgrounds */
  --color-background-main: #your-bg;
  --color-surface: #your-surface;
  
  /* Text */
  --color-text-primary: #your-text;
  --color-text-secondary: #your-secondary;
  
  /* Customize all variables... */
}
```

### Example Themes

#### 🌙 Dark Mode (Default)
```css
--color-background-main: #282828;
--color-primary: #016bff;
--color-text-primary: #f0f0f0;
```

#### ☀️ Light Mode
```css
--color-background-main: #ffffff;
--color-primary: #0066cc;
--color-text-primary: #212121;
```

#### 🎮 Cyberpunk
```css
--color-background-main: #0a0a0a;
--color-primary: #00ffff;
--color-text-primary: #00ffff;
--color-text-secondary: #ff00ff;
```

#### 🌸 Soft Pink
```css
--color-background-main: #2b1f2b;
--color-primary: #ff6b9d;
--color-text-primary: #ffeaa7;
```

---

## 🧪 Testing & Validation

### Testing Checklist

#### Visual Testing
- [ ] All text is readable (contrast ratio)
- [ ] Hover states are visible
- [ ] Focus states are clear
- [ ] Active/selected states are distinct

#### Interactive Testing
- [ ] Dropdowns show all options
- [ ] Checkboxes toggle correctly
- [ ] Input fields accept text
- [ ] Settings panel opens/closes

#### Cross-Site Testing
Test on all supported sites:
- [ ] https://chatgpt.com
- [ ] https://bard.google.com
- [ ] https://www.bing.com

#### Responsive Testing
- [ ] Container fits on 1024px screens
- [ ] Container fits on 1920px screens
- [ ] Text remains readable at all sizes

### Color Contrast Requirements

Ensure WCAG AA compliance:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 minimum

### Tools for Testing

1. **Chrome DevTools**
   - Inspect element styles
   - Test responsive layouts
   - Check contrast ratios

2. **Lighthouse**
   - Accessibility audit
   - Performance check

3. **Color Contrast Analyzers**
   - WebAIM Contrast Checker
   - Chrome's built-in contrast tool

---

## 📝 Best Practices

### DO's ✅
- Use CSS variables for all colors
- Test on all three target websites
- Maintain consistent spacing
- Keep hover states subtle
- Ensure text readability

### DON'Ts ❌
- Don't edit base.css
- Don't use !important (unless absolutely necessary)
- Don't remove transitions completely
- Don't use pure black (#000000) on pure white (#ffffff)
- Don't make text smaller than 11px

### Performance Tips
- Keep shadows subtle (performance impact)
- Limit animation complexity
- Use system fonts when possible
- Avoid gradient backgrounds on large areas

---

## 🚀 Quick Start Guide

1. **Open** `styles/theme.css`
2. **Find** the `:root` selector
3. **Modify** the CSS variables
4. **Save** and reload extension
5. **Test** on all supported sites

### Minimal Theme Change Example

To create a blue theme, change only these 3 variables:
```css
:root {
  --color-primary: #2196f3;        /* Blue accent */
  --color-background-main: #1a237e; /* Dark blue bg */
  --color-text-primary: #e3f2fd;   /* Light blue text */
}
```

---

## 📧 Delivery Checklist

When submitting your themed version:

- [ ] All CSS variables documented
- [ ] Theme tested on all 3 sites
- [ ] Screenshots provided
- [ ] Contrast ratios verified
- [ ] No functional CSS modified
- [ ] Animation performance checked
- [ ] Browser compatibility confirmed

---

## 🆘 Troubleshooting

### Common Issues

**Problem**: Changes don't appear
**Solution**: Clear browser cache, reload extension

**Problem**: Layout broken
**Solution**: You edited base.css - revert changes

**Problem**: Animations stuttering
**Solution**: Reduce shadow complexity, simplify transitions

**Problem**: Text unreadable
**Solution**: Check contrast ratios, adjust colors

---

## 📌 Quick Reference Card

```css
/* Most Important Selectors */
#prompt-generator-container     /* Main panel */
.prompt-generator-dropdown       /* All dropdowns */
.prompt-generator-input         /* Text inputs */
.checkbox_btn                   /* Checkbox buttons */
#language-selector              /* Language dropdown */
#settings-icon                  /* Settings gear */
.toggle-button                  /* On/off button */

/* Key States */
:hover                          /* Hover effects */
:focus                          /* Focus outlines */
.active                         /* Selected state */
.hidden                         /* Hidden elements */
.show                           /* Visible panels */
```

---

*Last updated: 2024 | Extension Version: 1.3*