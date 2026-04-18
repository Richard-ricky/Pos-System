# Glassmorphism Design System

## Overview

The FinTech Wallet application now features a modern glassmorphism design system with liquid glass effects, backdrop blur, and enhanced visual depth. This guide explains how to use and customize the glass effects throughout the application.

## What is Glassmorphism?

Glassmorphism (also known as "frosted glass" or "liquid glass") is a modern UI design trend that creates a translucent, frosted glass appearance with:
- Background blur
- Semi-transparent backgrounds
- Subtle borders
- Layered depth
- Enhanced readability with text shadows

## Available Glass Classes

### 1. `.glass` - Standard Glass Effect

The default glass effect suitable for most UI elements.

```tsx
<div className="glass rounded-lg p-6">
  <h3 className="glass-text">Standard Glass</h3>
  <p>This has a balanced glass effect perfect for cards and panels.</p>
</div>
```

**Properties:**
- Background: `rgba(255, 255, 255, 0.1)` (light) / `rgba(255, 255, 255, 0.05)` (dark)
- Backdrop blur: 16px
- Saturation: 180%
- Border: Semi-transparent white

### 2. `.glass-card` - Card Glass Effect

Enhanced glass effect specifically designed for card components.

```tsx
<div className="glass-card rounded-xl p-8">
  <h2 className="glass-text">Glass Card</h2>
  <p>Perfect for prominent cards and feature sections.</p>
</div>
```

**Properties:**
- Background: `rgba(255, 255, 255, 0.08)`
- Backdrop blur: 20px
- Saturation: 200%
- Stronger border and shadow

### 3. `.glass-strong` - Strong Glass Effect

More opaque glass effect for elements that need more emphasis.

```tsx
<div className="glass-strong rounded-lg p-6">
  <h3 className="glass-text">Strong Glass</h3>
  <p>Use for modals, dialogs, or primary content areas.</p>
</div>
```

**Properties:**
- Background: `rgba(255, 255, 255, 0.12)`
- Backdrop blur: 24px
- Saturation: 220%
- Most opaque variant

### 4. `.glass-subtle` - Subtle Glass Effect

Minimal glass effect for backgrounds and secondary elements.

```tsx
<div className="glass-subtle rounded-lg p-4">
  <span className="glass-text">Subtle Glass</span>
</div>
```

**Properties:**
- Background: `rgba(255, 255, 255, 0.03)`
- Backdrop blur: 12px
- Saturation: 150%
- Most transparent variant

## Text Enhancement

### `.glass-text` - Enhanced Text Readability

Apply to text within glass elements for improved contrast and readability.

```tsx
<div className="glass-card">
  <h2 className="glass-text">Enhanced Title</h2>
  <p className="glass-text">Enhanced paragraph text</p>
</div>
```

**Properties:**
- Text shadow: `0 2px 4px rgba(0, 0, 0, 0.3)`
- Font weight: 500

## Usage Examples

### Notification Center

```tsx
<SheetContent className="glass-card">
  <SheetTitle className="glass-text">
    Notifications
  </SheetTitle>
  <div className="space-y-2">
    <div className="glass rounded-lg p-4">
      <h4 className="glass-text">Transaction Completed</h4>
    </div>
  </div>
</SheetContent>
```

### Modal Dialog

```tsx
<Dialog>
  <DialogContent className="glass-strong">
    <DialogTitle className="glass-text">
      Confirm Payment
    </DialogTitle>
    <DialogDescription className="glass-text opacity-80">
      Review the transaction details below
    </DialogDescription>
  </DialogContent>
</Dialog>
```

### Cards

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="glass-card rounded-xl p-6">
    <h3 className="glass-text text-lg font-semibold mb-2">
      Total Balance
    </h3>
    <p className="glass-text text-3xl font-bold">
      GHS 12,450.00
    </p>
  </div>
</div>
```

### Background Overlay

```tsx
<div className="fixed inset-0 glass-subtle backdrop-blur-2xl">
  <div className="glass-strong max-w-md mx-auto mt-20 rounded-2xl p-8">
    <h1 className="glass-text text-2xl font-bold">
      Welcome Back
    </h1>
  </div>
</div>
```

### Navigation

```tsx
<nav className="glass sticky top-0 z-50">
  <div className="container mx-auto px-4">
    <div className="flex items-center justify-between py-4">
      <Logo className="glass-text" />
      <NavLinks className="glass-text" />
    </div>
  </div>
</nav>
```

## Combining with Tailwind

Glass effects work seamlessly with Tailwind CSS utilities:

```tsx
// Glass card with hover effect
<div className="glass-card rounded-xl p-6 hover:scale-105 transition-transform">
  <h3 className="glass-text">Interactive Card</h3>
</div>

// Glass with custom background color
<div className="glass rounded-lg p-4 bg-purple-500/10">
  <span className="glass-text text-purple-300">Colored Glass</span>
</div>

// Glass with animation
<div className="glass-card rounded-xl p-6 animate-fade-in">
  <h3 className="glass-text">Animated Entry</h3>
</div>

// Responsive glass
<div className="glass-subtle md:glass-card lg:glass-strong rounded-lg p-4">
  <span className="glass-text">Responsive Glass</span>
</div>
```

## Color Overlays

Add tinted glass effects:

```tsx
// Purple tinted glass
<div className="glass rounded-lg p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
  <h3 className="glass-text">Purple Glass</h3>
</div>

// Blue tinted glass
<div className="glass-card rounded-xl p-8 bg-blue-500/5">
  <h2 className="glass-text text-blue-300">Blue Glass</h2>
</div>

// Green tinted glass (for success states)
<div className="glass rounded-lg p-4 bg-green-500/10 border-green-500/20">
  <p className="glass-text text-green-300">Success Message</p>
</div>

// Red tinted glass (for error states)
<div className="glass rounded-lg p-4 bg-red-500/10 border-red-500/20">
  <p className="glass-text text-red-300">Error Message</p>
</div>
```

## Advanced Patterns

### Layered Glass

Create depth with multiple glass layers:

```tsx
<div className="glass-subtle rounded-2xl p-8">
  <div className="glass rounded-xl p-6 mb-4">
    <h3 className="glass-text">Layer 1</h3>
  </div>
  <div className="glass-card rounded-xl p-6">
    <h3 className="glass-text">Layer 2</h3>
  </div>
</div>
```

### Glass with Gradient Border

```tsx
<div className="glass-card rounded-xl p-6 relative overflow-hidden">
  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-500 to-pink-500 opacity-50 blur-sm"></div>
  <div className="relative z-10">
    <h3 className="glass-text">Gradient Border Glass</h3>
  </div>
</div>
```

### Animated Glass

```tsx
<motion.div 
  className="glass-card rounded-xl p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.3 }}
>
  <h3 className="glass-text">Animated Glass Card</h3>
</motion.div>
```

## Customization

### CSS Variables

Customize glass effects globally in your theme:

```css
:root {
  /* Light mode glass */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: rgba(0, 0, 0, 0.1);
}

.dark {
  /* Dark mode glass */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: rgba(0, 0, 0, 0.3);
}
```

### Custom Glass Classes

Create your own glass variants:

```css
/* Extra strong glass */
.glass-extra-strong {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px) saturate(250%);
  -webkit-backdrop-filter: blur(30px) saturate(250%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.3);
}

/* Minimal glass */
.glass-minimal {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px) saturate(120%);
  -webkit-backdrop-filter: blur(8px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.1);
}
```

## Best Practices

### 1. Content Behind Glass
- Ensure there's visual content behind glass elements
- Use gradients or images as backgrounds
- Avoid plain white/black backgrounds

### 2. Text Contrast
- Always use `.glass-text` for text inside glass elements
- Test readability in both light and dark modes
- Consider adding stronger backgrounds for critical text

### 3. Performance
- Use glass effects sparingly on mobile devices
- Backdrop blur can be performance-intensive
- Consider disabling blur on low-end devices

### 4. Accessibility
- Ensure sufficient contrast ratios (WCAG AA/AAA)
- Don't rely solely on glass effects for information
- Test with screen readers

### 5. Dark Mode
- Glass effects look best in dark mode
- Adjust opacity for light mode if needed
- Test in both modes before deployment

## Browser Support

Glassmorphism requires modern browser features:

```css
/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(10px)) {
  .glass,
  .glass-card,
  .glass-strong,
  .glass-subtle {
    background: rgba(0, 0, 0, 0.8); /* Solid fallback */
  }
}
```

**Supported Browsers:**
- Chrome/Edge 76+
- Firefox 103+
- Safari 15.4+
- iOS Safari 15.4+

## Inspiration and Examples

### Dashboard Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {metrics.map((metric) => (
    <div key={metric.id} className="glass-card rounded-2xl p-6 hover:glass-strong transition-all">
      <div className="flex items-center justify-between mb-4">
        <metric.icon className="size-8 text-purple-400" />
        <span className="glass-text text-sm text-purple-300">{metric.label}</span>
      </div>
      <p className="glass-text text-3xl font-bold">{metric.value}</p>
      <p className="glass-text text-sm opacity-60 mt-2">{metric.change}</p>
    </div>
  ))}
</div>
```

### Feature Highlights
```tsx
<section className="glass-subtle rounded-3xl p-12">
  <h2 className="glass-text text-4xl font-bold text-center mb-12">
    Features
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {features.map((feature) => (
      <div key={feature.id} className="glass-card rounded-xl p-6 text-center">
        <feature.icon className="size-12 mx-auto mb-4 text-purple-400" />
        <h3 className="glass-text text-lg font-semibold mb-2">
          {feature.title}
        </h3>
        <p className="glass-text text-sm opacity-70">
          {feature.description}
        </p>
      </div>
    ))}
  </div>
</section>
```

## Resources

- **Design Inspiration:** [Glassmorphism UI](https://hype4.academy/tools/glassmorphism-generator)
- **CSS Generator:** [Glass UI](https://ui.glass/generator/)
- **Examples:** Check `/src/app/components/notifications/NotificationCenter.tsx`

## Troubleshooting

### Glass effect not visible
1. Ensure there's content/color behind the element
2. Check if backdrop-filter is supported in your browser
3. Verify CSS is loaded correctly

### Poor performance
1. Reduce blur amount (e.g., blur(12px) instead of blur(24px))
2. Use fewer glass elements on the page
3. Consider disabling on mobile devices

### Text hard to read
1. Add `.glass-text` class to all text
2. Increase background opacity
3. Use `.glass-strong` instead of `.glass-subtle`
4. Add stronger text shadows

## Conclusion

Glassmorphism adds a modern, sophisticated look to your application. Use it strategically to create depth, hierarchy, and visual interest while maintaining usability and performance.
