# Visual Guide - New Features Showcase

## 🔔 Notification Center

### Location
The notification center is located in the **header** of the application, next to the user profile menu.

### Features
```
┌─────────────────────────────────────────────────┐
│  [🔔 Bell Icon with Badge]                      │
│                                                  │
│  Click to open notification panel:              │
│  ┌──────────────────────────────────────┐      │
│  │  Notifications                   [✓] [🗑] │   │
│  │                                          │   │
│  │  ┌────────────────────────────────┐   │   │
│  │  │ 💳 Transaction Received         │   │   │
│  │  │ GHS 500.00 credited to wallet  │   │   │
│  │  │ 5m ago                    [•]  │   │   │
│  │  └────────────────────────────────┘   │   │
│  │                                          │   │
│  │  ┌────────────────────────────────┐   │   │
│  │  │ 💰 Payment Successful           │   │   │
│  │  │ Payment to John Doe completed  │   │   │
│  │  │ 2h ago                         │   │   │
│  │  └────────────────────────────────┘   │   │
│  │                                          │   │
│  │  [Mark all read]  [Clear all]          │   │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

### Visual Indicators
- **Badge:** Red circle showing unread count (1-9+)
- **Blue dot:** Indicates unread notification
- **Icons:** Emoji icons for each notification type
- **Animations:** Smooth slide-in and fade effects
- **Glass effect:** Frosted glass background

## 🎨 Glassmorphism Effects

### Before (Standard Card)
```
┌──────────────────────────┐
│ Solid background         │
│ No blur, flat design     │
│ Traditional card look    │
└──────────────────────────┘
```

### After (Glass Card)
```
┌──────────────────────────┐
│ ░░░ Frosted glass ░░░    │
│ ▓▓ Blurred backdrop ▓▓   │
│ ▒▒ Transparent depth ▒▒  │
└──────────────────────────┘
      Behind: Background gradient
      Effect: Blur + Saturation
      Border: Semi-transparent glow
```

### Where Applied

#### 1. Wallet Dashboard - Balance Card
```
╔═══════════════════════════════════════╗
║ [Glass Card with Gradient Background] ║
║                                        ║
║   Available Balance          [👁]      ║
║   GHS 12,450.00                       ║
║                                        ║
║   [Add Money]  [Send Money]           ║
╚═══════════════════════════════════════╝
  ^ Glassmorphism with purple-pink gradient
```

#### 2. Linked Accounts Cards
```
┌──────────────────┐  ┌──────────────────┐
│ [Glass Card]     │  │ [Glass Card]     │
│                  │  │                  │
│ 💳 Linked Cards │  │ 📱 Mobile Money │
│    2 accounts    │  │    1 account     │
└──────────────────┘  └──────────────────┘
  ^ Subtle glass effect with hover animation
```

#### 3. Transaction Items
```
┌──────────────────────────────────────┐
│ [Glass Subtle - Hover to Glass]     │
│                                      │
│ 💳 TRANSACTION        +GHS 500.00   │
│ Apr 4, 2026 • PAYSTACK   Completed  │
└──────────────────────────────────────┘
  ^ Subtle glass, transforms on hover
```

#### 4. Notification Panel
```
╔════════════════════════════════════╗
║ [Glass Strong Background]          ║
║                                    ║
║  Notifications             [✓] [🗑] ║
║                                    ║
║  ┌───────────────────────────┐   ║
║  │ [Glass Card]              │   ║
║  │ 💰 Notification Content   │   ║
║  └───────────────────────────┘   ║
╚══════════════════════��═════════════╝
  ^ Strong glass for modal overlay
```

## 📱 SMS Flow Visualization

### Transaction SMS Flow
```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│  User does  │──────▶│   Backend    │──────▶│   Twilio   │
│ transaction │      │  creates SMS │      │    API     │
└─────────────┘      └──────────────┘      └────────────┘
                                                   │
                                                   ▼
                                            ┌────────────┐
                                            │ User Phone │
                                            │  receives  │
                                            │    SMS     │
                                            └────────────┘

SMS Content Example:
┌─────────────────────────────────────────────┐
│ Your wallet has been credited with GHS     │
│ 500.00. New balance: GHS 2500.00.          │
│ Ref: TXN123456                             │
└─────────────────────────────────────────────┘
```

### Mock Mode (Development)
```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│  User does  │──────▶│   Backend    │──────▶│  Console   │
│ transaction │      │  logs SMS    │      │   Log      │
└─────────────┘      └──────────────┘      └────────────┘

Console Output:
SMS to +233244123456: Your message
SMS sent successfully (mock mode)
```

## 🔄 Notification Flow

### Real-time Notification Flow
```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Backend   │──────▶│   Supabase   │──────▶│  Frontend  │
│   Action    │      │   Database   │      │ Realtime   │
└─────────────┘      └──────────────┘      └────────────┘
                                                   │
                                                   ▼
                                        ┌──────────────────┐
                                        │  Updates Badge   │
                                        │  Shows Popup     │
                                        │  Plays Sound     │
                                        └──────────────────┘
```

### Browser Notification
```
┌────────────────────────────────────────┐
│  [🔔 Browser Notification]             │
│                                        │
│  FinTech Wallet                        │
│  💳 Transaction Received               │
│  GHS 500.00 credited to wallet         │
│                                        │
│  [Close]                               │
└────────────────────────────────────────┘
  ^ Appears outside browser window
```

## 🎭 Dark Mode Optimization

### Light Mode Glass
```
Background: rgba(255, 255, 255, 0.1)
Border: rgba(255, 255, 255, 0.2)
Blur: 16px
Text Shadow: Light
```

### Dark Mode Glass (Current)
```
Background: rgba(255, 255, 255, 0.05)
Border: rgba(255, 255, 255, 0.1)
Blur: 16px
Text Shadow: Dark (0 2px 4px rgba(0, 0, 0, 0.3))
```

### Visual Comparison
```
Light Mode:           Dark Mode (Active):
┌──────────┐          ┌──────────┐
│ ▓▓▓▓▓▓▓▓ │          │ ░░░░░░░░ │
│ ▓ Text ▓ │          │ ░ Text ░ │
│ ▓▓▓▓▓▓▓▓ │          │ ░░░░░░░░ │
└──────────┘          └──────────┘
 More opaque          More subtle
```

## 📊 Component Hierarchy

### Wallet Dashboard Structure
```
WalletDashboard
├── Balance Card (glass-card + gradient)
│   ├── Title (glass-text)
│   ├── Amount Display (glass-text)
│   └── Action Buttons
├── Linked Accounts Grid
│   ├── Cards Card (glass)
│   │   └── Content (glass-text)
│   └── Mobile Money Card (glass)
│       └── Content (glass-text)
└── Transactions Card (glass)
    ├── Header (glass-text)
    └── Transaction Items (glass-subtle → glass on hover)
        └── Details (glass-text)
```

### Notification Center Structure
```
NotificationCenter
├── Bell Icon Button
│   └── Badge (unread count)
└── Sheet Panel (glass-card)
    ├── Header (glass-text)
    │   ├── Title
    │   └── Actions (Mark all, Clear all)
    └── Notification List
        └── Notification Items (glass-card / glass-subtle)
            ├── Icon (emoji)
            ├── Title (glass-text)
            ├── Message (glass-text)
            ├── Timestamp (glass-text)
            └── Actions (Delete)
```

## 🎨 Color Scheme with Glass

### Primary Colors
```
Purple: #9333EA ──┐
                  ├─→ Applied to glass backgrounds
Pink:   #EC4899 ──┘    with 10-20% opacity

Blue:   #3B82F6 ──→ Cards glass tint (5-10%)
Green:  #10B981 ──→ MoMo glass tint (5-10%)
Red:    #EF4444 ──→ Alert glass tint (5-10%)
```

### Glass Layers
```
Layer 3: glass-strong (12% opacity) ─┐
Layer 2: glass-card (8% opacity)     ├─→ Depth
Layer 1: glass (5% opacity)          │
Layer 0: glass-subtle (3% opacity) ──┘
```

## 🖼️ Screenshot Guide

### Wallet Dashboard
```
┌────────────────────────────────────────────────┐
│ [Header with Notification Bell]               │
├────────────────────────────────────────────────┤
│                                                │
│  ╔═══════════════════════════════════╗       │
│  ║ 💜 Available Balance       [👁]   ║       │
│  ║ GHS 12,450.00                     ║       │
│  ║ [Add Money] [Send Money]          ║       │
│  ╚═══════════════════════════════════╝       │
│                                                │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ 💳 Cards     │  │ 📱 MoMo      │          │
│  │ 2 accounts   │  │ 1 account    │          │
│  └──────────────┘  └──────────────┘          │
│                                                │
│  ┌─────────────────────────────────┐         │
│  │ Recent Transactions             │         │
│  │ ┌─────────────────────────┐    │         │
│  │ │ 💳 FUND  +GHS 500.00   │    │         │
│  │ └─────────────────────────┘    │         │
│  └─────────────────────────────────┘         │
└────────────────────────────────────────────────┘
```

### Notification Panel Open
```
┌────────────────────────────────────────────────┐
│ [🔔 (3)]  [User Menu]                         │
└────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │ Notifications     [✓] [🗑] │
        │                           │
        │ ┌───────────────────┐   │
        │ │ 💳 Transaction •  │   │
        │ │ Received GHS 500  │   │
        │ │ 5m ago            │   │
        │ └───────────────────┘   │
        │                           │
        │ ┌───────────────────┐   │
        │ │ 💰 Payment        │   │
        │ │ Success           │   │
        │ │ 2h ago            │   │
        │ └───────────────────┘   │
        └───────────────────────────┘
```

## 🎬 Animation Timeline

### Notification Appear
```
0ms   ─┬─→ opacity: 0, y: 20
       │
100ms ─┤
       │
200ms ─┴─→ opacity: 1, y: 0 (visible)
```

### Glass Hover Effect
```
Default:     hover:          active:
┌────┐       ┌────┐          ┌────┐
│ ░░ │   →   │ ▒▒ │    →     │ ▓▓ │
└────┘       └────┘          └────┘
subtle       normal          strong
```

### Badge Pulse
```
0%   ─┬─→ scale: 1
      │
50%  ─┼─→ scale: 1.1
      │
100% ─┴─→ scale: 1
```

## 📐 Spacing & Sizing

### Notification Items
```
Padding: 16px (p-4)
Border Radius: 12px (rounded-lg)
Gap between items: 8px (space-y-2)
Icon size: 32px (size-8)
```

### Glass Effects
```
Blur: 12px (subtle), 16px (default), 20px (card), 24px (strong)
Opacity: 3% (subtle), 5% (default), 8% (card), 12% (strong)
Border: 1px solid with matching opacity
```

### Responsive Breakpoints
```
Mobile:  < 640px  (Full width)
Tablet:  640-1024px (Grid 2 columns)
Desktop: > 1024px (Grid 3 columns)
```

## 🔍 Inspection Tips

### Chrome DevTools
```
1. Right-click on glass element
2. Select "Inspect"
3. Look for classes:
   - .glass / .glass-card / .glass-strong / .glass-subtle
4. Check Computed styles:
   - backdrop-filter: blur(Xpx) saturate(X%)
   - background: rgba(255, 255, 255, 0.XX)
```

### Testing Glassmorphism
```
1. Add contrasting background:
   <div style="background: linear-gradient(45deg, purple, pink)">
     <div className="glass-card">Content</div>
   </div>

2. Should see blurred gradient through glass
3. Text should remain readable
4. Border should be visible but subtle
```

This visual guide shows how all the new features look and work together in your application!
