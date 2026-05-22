# MATCHA GLASS v2.0 — Liquid Glass Design System

## 🌿 Концепция

**MATCHA GLASS** — это современный organic liquid UI, вдохновлённый iOS 26 Liquid Glass, Apple Human Interface и Pinterest aesthetic.

### Главная идея
> "Светящийся через стекло. Не тёмный dashboard, а layered liquid workspace."

### Эмоция
- Calm
- Clean
- Naturally premium
- Slightly emotional
- Organic technology
- "Quiet confidence"

## 🎨 Визуальный язык

### Основные принципы

**НЕ делаем:**
- ❌ Heavy dark dashboard
- ❌ Pure black backgrounds
- ❌ Overly dark surfaces
- ❌ Aggressive contrast
- ❌ Cyberpunk/neon effects
- ❌ Toxic green
- ❌ Fake glass everywhere
- ❌ Too much blur
- ❌ Dribbble concept mess

**Делаем:**
- ✅ Translucent surfaces
- ✅ Frosted layers
- ✅ Soft reflections
- ✅ Depth hierarchy
- ✅ Ambient gradients
- ✅ Subtle saturation
- ✅ Light diffusion
- ✅ "Breathing" interface
- ✅ Layered illumination
- ✅ Misty green overlays
- ✅ Dark olive translucent backgrounds
- ✅ Soft atmospheric lighting

## 🌈 Цветовая система

### Matcha Palette
```
#baee9a — Pale matcha highlight (самый светлый)
#8dd573 — Soft matcha (primary)
#80cfb4 — Soft mint (secondary)
#77b855 — Matcha mid
#58ab5a — Muted deep green (shadow)
#46ad89 — Mint green
#2b7747 — Organic shadow (deepest)
#175e15 — Matcha deepest
#09201a — Deep olive (background base)
#a4a4a4 — Neutral gray (muted)
```

### Background Layers
```
--background: #0c1814 (deep olive, not pure black)
--background-gradient-start: #0e1c18
--background-gradient-end: #0a1411
```

### Surface Layers (TRANSLUCENT)
```
--surface: rgba(14, 24, 20, 0.6) — 60% opacity
--surface-hover: rgba(16, 28, 24, 0.7)
--card: rgba(12, 22, 18, 0.55) — 55% opacity
```

### Text Luminosity
```
--foreground: #e4e4e4 (lighter than before)
--foreground-muted: #a0a0a0
--foreground-subtle: #787878
```

## 🏗️ Glass System

### Three Glass Layers

**glass-light** — 45% opacity, blur 24px
- Subtle overlays
- Secondary panels
```css
background: rgba(14, 26, 22, 0.45)
backdrop-filter: blur(24px)
border: 1px solid rgba(255,255,255,0.03)
```

**glass** — 55% opacity, blur 28px
- Header
- Filters
- Floating panels
```css
background: rgba(14, 26, 22, 0.55)
backdrop-filter: blur(28px)
border: 1px solid rgba(255,255,255,0.04)
box-shadow: 0 4px 12px rgba(12,22,18,0.3)
```

**glass-strong** — 75% opacity, blur 40px
- Cards
- Modals
- Active panels
```css
background: rgba(14, 26, 22, 0.75)
backdrop-filter: blur(40px)
border: 1px solid rgba(186,238,154,0.1)
box-shadow: 0 8px 24px rgba(12,22,18,0.35)
inset: 0 1px 0 rgba(255,255,255,0.03)
```

### Ambient Background (4 layers)

```css
/* 1. Top ambient light — soft matcha diffusion */
radial-gradient(ellipse 70% 40% at 50% -10%, 
  rgba(141, 213, 115, 0.08), transparent 60%)

/* 2. Right soft glow — mint mist */
radial-gradient(ellipse 50% 35% at 85% 50%, 
  rgba(128, 207, 180, 0.05), transparent 70%)

/* 3. Left subtle depth — deep green */
radial-gradient(ellipse 45% 30% at 15% 70%, 
  rgba(43, 119, 71, 0.04), transparent 75%)

/* 4. Bottom atmospheric vignette */
radial-gradient(ellipse 80% 50% at 50% 100%, 
  rgba(12, 22, 18, 0.4), transparent 50%)

/* 5. Base gradient */
linear-gradient(180deg, #0e1c18 0%, #0a1411 100%)
```

### Ambient Orbs (blurred, layered)

```css
/* Primary — top-right */
blur: 100px
opacity: 0.25
rgba(141, 213, 115, 0.12)

/* Secondary — bottom-left */
blur: 100px
opacity: 0.25
rgba(128, 207, 180, 0.06)

/* Accent — center-left */
blur: 100px
opacity: 0.25
rgba(186, 238, 154, 0.04)
```

## 🎯 Компоненты

### Buttons

**btn-primary** — Soft matcha gradient
```css
background: linear-gradient(135deg, #8dd573 0%, #58ab5a 100%)
border: 1px solid rgba(186, 238, 154, 0.25)
box-shadow: 0 2px 12px rgba(141, 213, 115, 0.08)
hover: translateY(-1px) + stronger glow
inset highlight: 0 1px 0 rgba(255,255,255,0.25)
```

**btn-accent** — Mint gradient
```css
background: linear-gradient(135deg, #80cfb4 0%, #8dd573 100%)
```

### Cards (FLOATING, TRANSLUCENT)

```css
.card {
  background: rgba(12, 22, 18, 0.55)
  border: 1px solid rgba(186, 238, 154, 0.06)
  box-shadow: 0 4px 12px rgba(12, 22, 18, 0.3)
  hover: translateY(-2px) + shadow-lg
  
  /* Layered border gradient */
  ::before: 135deg gradient (highlight → transparent → subtle)
  
  /* Mouse glow effect */
  ::after: radial-gradient at cursor
}
```

### Badges (NATURAL, SOFT GLOW)

**badge--new** — Pulsing pale matcha
```css
background: rgba(186, 238, 154, 0.15)
text: #baee9a
border: rgba(186, 238, 154, 0.2)
shadow: 0 0 16px rgba(141, 213, 115, 0.12)
animation: pulse 3s
```

**badge--preparing** — Deep matcha
**badge--ready** — Mint
**badge--closed** — Neutral gray

### Inputs (SOFT FOCUS GLOW)

```css
background: rgba(14, 24, 20, 0.6)
border: 1px solid rgba(186, 238, 154, 0.06)
focus: border-matcha + 4px glow ring
```

## 📐 Типографика

**Font:** Inter (400, 450, 500, 550, 600, 650, 700)

**Weight philosophy:**
- 400 — body
- 450 — soft emphasis
- 500 — medium emphasis
- 550 — semi-bold (buttons, badges)
- 600 — strong emphasis
- 700 — headlines

## 🎬 Анимации

### Timing
```
Fast: 100ms
Base: 180ms
Slow: 300ms
Spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Keyframes
```css
fadeIn: translateY(12px) → 0, opacity 0 → 1
shimmer: background-position -200% → 200%
pulse-matcha: opacity 1 → 0.7 → 1 (3s)
```

## 📱 Layout

### Header (visionOS style)
- Floating translucent topbar
- Backdrop blur: 40px
- Soft matcha tint
- Thin glass borders
- Subtle highlights
- Looks like visionOS/iOS26 native app

### Logo
- Modern app icon style
- Glass layered effect
- Subtle matcha gradients
- Soft reflection
- Rounded geometry
- Leaf icon (instead of Sparkles)

### Visual Density
**MEDIUM** — balanced between:
- Apple (air)
- Linear (density)
- Arc Browser (translucency)

## 🔧 Технические детали

### CSS Variables
```css
/* Background & surfaces */
--background, --surface, --card
--background-gradient-start/end

/* Matcha palette */
--matcha-light, --matcha, --matcha-dark, --matcha-deep
--mint

/* Text */
--foreground, --foreground-muted, --foreground-subtle

/* Borders */
--border, --border-strong, --border-subtle
--border-glass, --border-highlight

/* Shadows */
--shadow-sm, --shadow, --shadow-lg, --shadow-xl
--shadow-matcha

/* Glass */
--glass, --glass-strong, --glass-light
--backdrop-blur, --backdrop-blur-xl

/* Animation */
--transition-fast/base/slow
--spring-soft
```

### Glass Formula
```
rgba(14, 26, 22, OPACITY)
backdrop-filter: blur(px)
border: 1px solid rgba(186, 238, 154, STRENGTH)
box-shadow: depth + color
```

### Tailwind Config
```js
colors: {
  matcha: { light, DEFAULT, dark, deep },
  mint
}
// All mapped to CSS variables
```

## 🌟 Ключевые отличия от v1

| Параметр | v1 | v2 |
|----------|-----|-----|
| **Background** | Deep black | Deep olive (lighter) |
| **Glass opacity** | 65-85% | 45-75% (more translucent) |
| **Blur** | 24-30px | 28-40px (more diffusion) |
| **Shadows** | Harder | Softer, more atmospheric |
| **Badges** | Brighter | More muted, softer glow |
| **Glow intensity** | 0.15 | 0.06-0.12 (subtler) |
| **Ambient orbs** | 0.35 opacity | 0.25 opacity (lighter) |
| **Overall feel** | Dark dashboard | Liquid workspace |

## ✨ Философия

> "Интерфейс должен выглядеть как утренний свет в matcha café возле окна. Не тёмный, а 'светящийся через стекло'."

**Пользователь должен подумать:**
- "Это выглядит очень современно"
- "Очень спокойно"
- "Очень дорого"
- Но без ощущения, что дизайн пытается это доказать

## 📁 Файлы

```
src/
├── App.jsx — visionOS header, ambient orbs
├── main.jsx
├── components/
│   ├── EmployeeOrders.jsx
│   └── OwnerPanel.jsx
└── styles/
    ├── theme.css — CSS variables
    └── globals.css — design system
```

---

**Результат:** calm premium software, organic operating system, modern Japanese café workspace, quiet luxury, liquid depth, soft technology.
