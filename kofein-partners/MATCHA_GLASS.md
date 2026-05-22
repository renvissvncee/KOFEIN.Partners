# MATCHA GLASS — Дизайн-система KOFEIN.PARTNERS

## 🎨 Концепция

**MATCHA GLASS** — это спокойный, органичный премиум UI в стиле Japanese minimalism + modern SaaS.

### Эмоция
> "Тихая уверенность. Спокойный premium. Organic technology."

### Вдохновение
- Liquid Glass iOS
- Apple design
- Pinterest aesthetic
- Japanese minimalism
- Matcha café atmosphere
- Calm nature-inspired UI

## 🌿 Цветовая палитра

### Matcha Greens
```
#baee9a — Matcha Light (высвечивания)
#8dd573 — Matcha Primary (основной)
#80cfb4 — Mint (акцент)
#77b855 — Matcha Mid (средний)
#58ab5a — Matcha Dark (тени)
#2b7747 — Matcha Deep (глубокий)
#175e15 — Matcha Deepest (очень тёмный)
```

### Backgrounds
```
#09201a — Background (глубокий зелёный)
#0d2920 — Gradient Start
#0f261e — Surface
#102820 — Card
```

### Text
```
#e8e8e8 — Foreground (основной текст)
#a4a4a4 — Muted (второстепенный)
#7a7a7a — Subtle (акценты)
```

### Borders
```
rgba(186, 238, 154, 0.08) — Border (subtle)
rgba(186, 238, 154, 0.12) — Border Strong
rgba(186, 238, 154, 0.04) — Border Subtle
```

## 🏗️ Структура

### Glass Layers

**glass** — 65% opacity, blur 24px
- Фильтры
- Floating panels
- Header

**glass-strong** — 85% opacity, blur 30px
- Карточки
- Модальные окна
- Активные элементы

**glass-panel** — Градиентный glass
- Основные панели
- Контейнеры

### Ambient Background

```css
/* 3 radial gradients + vignette */
radial-gradient(ellipse 80% 50% at 50% -20%, rgba(141, 213, 115, 0.12))
radial-gradient(ellipse 60% 40% at 80% 60%, rgba(128, 207, 180, 0.08))
radial-gradient(ellipse 40% 30% at 20% 80%, rgba(88, 171, 90, 0.06))
linear-gradient(180deg, #0d2920 0%, #09201a 100%)
```

### Ambient Orbs
```
- Primary: top-right, cyan-green glow
- Secondary: bottom-left, mint glow
- Accent: center-left, soft matcha
```

## 🎯 Компоненты

### Buttons

**btn-primary** — Matcha gradient
```
Background: linear-gradient(135deg, #8dd573 0%, #58ab5a 100%)
Border: rgba(186, 238, 154, 0.3)
Shadow: 0 2px 8px var(--primary-glow)
Hover: translateY(-1px) + stronger glow
```

**btn-accent** — Mint gradient
```
Background: linear-gradient(135deg, #80cfb4 0%, #58ab5a 100%)
```

**btn-ghost** — Subtle hover
```
Transparent background
Hover: surface-hover + border
```

### Cards

**card** — Base card
```
Background: var(--card)
Border: 1px solid var(--border)
Radius: 1.25rem
Hover: translateY(-2px) + shadow-lg
```

**card::before** — Layered border gradient
```
135deg gradient
Strong → Transparent → Subtle
```

**card::after** — Mouse glow effect
```
Radial gradient at cursor position
opacity: 0 → 1 on hover
```

**card--elevated** — Enhanced depth
```
Vertical gradient background
Inset border shadow
```

### Badges

**badge--new** — Pulsing matcha
```
Background: rgba(186, 238, 154, 0.2)
Text: #baee9a
Animation: pulse 2s
```

**badge--preparing** — Deep matcha
```
Background: rgba(88, 171, 90, 0.2)
Text: #a8e096
```

**badge--ready** — Mint
```
Background: rgba(128, 207, 180, 0.25)
Text: #b8f0d0
```

**badge--closed** — Neutral
```
Background: rgba(164, 164, 164, 0.15)
Text: #b0b0b0
```

### Inputs

```
Background: var(--surface)
Border: 1px solid var(--border)
Focus: border-matcha + glow ring
Placeholder: foreground-subtle
```

## 📐 Типографика

**Font:** Inter (400, 450, 500, 550, 600, 650, 700)

**Sizes:**
- H1: 3xl/4xl (responsive)
- H2: 2xl/3xl
- Body: base (0.875rem)
- Small: sm (0.8125rem)
- XS: xs (0.75rem)

**Line-height:**
- Tight: 1.25
- Normal: 1.5

## 🎬 Анимации

### Timing
```
Fast: 120ms cubic-bezier(0.4, 0, 0.2, 1)
Base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
Slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)
Spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Keyframes
```css
fadeIn: translateY(10px) → 0, opacity 0 → 1
shimmer: background-position -200% → 200%
pulse-matcha: opacity 1 → 0.75 → 1
```

## 📱 Адаптивность

**Mobile-first**
- < 640px: 1 колонка, compact
- 640-768px: 2 колонки
- > 768px: 3 колонки

**Touch targets:**
- Минимум 44x44px
- Bottom safe area 20px

## 🎨 UI Паттерны

### Header
- Floating glass-strong topbar
- Minimalist logo with gradient
- Segmented role switcher (btn-primary active)
- Theme toggle button

### Filters
- Glass panel container
- Segmented control
- Animated active state
- Counters with subtle background

### Order Cards
- Glass-strong background
- Border matcha/10 → matcha/30 on hover
- Staggered animation
- Glow shadow on hover

### Menu Cards
- Glass-strong with matcha border
- Inline editing mode
- Custom toggle switch
- Action buttons (edit/delete)

### Tabs
- Glass panel toolbar
- Gradient active state
- Counters
- Smooth transitions

## 🔧 Технические детали

### CSS Variables
```css
--background, --surface, --card
--matcha-light, --matcha, --matcha-dark, --matcha-deep
--mint
--foreground, --foreground-muted, --foreground-subtle
--border, --border-strong, --border-subtle
--shadow*, --radius*
--glass, --glass-strong, --backdrop-blur
--transition*, --spring-soft
```

### Tailwind Config
```js
colors: {
  matcha: { light, DEFAULT, dark, deep },
  mint,
  primary: 'var(--primary)',
  // ... mapped to CSS variables
}
```

### Custom Scrollbar
```css
width: 8px
thumb: border-strong
hover: matcha-dark
```

## ✨ Особенности

### Что НЕ используем
- ❌ Neon/cyberpunk
- ❌ Яркий toxic green
- ❌ Gaming RGB
- ❌ Overly glossy
- ❌ Flashy animations

### Что используем
- ✅ Soft organic gradients
- ✅ Natural green palette
- ✅ Calm shadows
- ✅ Subtle transparency
- ✅ Smooth micro-interactions
- ✅ Layered depth
- ✅ Pinterest aesthetic

## 📊 Файловая структура

```
src/
├── App.jsx — layout с ambient orbs
├── main.jsx
├── components/
│   ├── ui/
│   │   └── index.js
│   ├── EmployeeOrders.jsx
│   └── OwnerPanel.jsx
└── styles/
    ├── theme.css — CSS variables
    └── globals.css — дизайн-система
```

---

**Итог:** Спокойный, дорогой, органичный premium UI, который выглядит естественно и уверенно. Не кричит "посмотрите на меня", а говорит "мы просто хорошо делаем продукт".
