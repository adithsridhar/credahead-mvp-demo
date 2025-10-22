# 📱 Professional Mobile UI Wireframes - CredAhead

## Current Issues Identified:
- Headings too large on mobile (H4 at 1.75rem feels overwhelming)
- Inconsistent spacing creating visual chaos
- Poor typography hierarchy
- Buttons and form elements not optimized for touch

---

## 🎨 **WIREFRAME 1: Sign-In Page (Mobile)**

```
┌─────────────────────────────┐
│ CredAhead              [?] │ ← Navigation (compact)
├─────────────────────────────┤
│                             │
│          [LOGO/ICON]        │ ← Smaller, centered brand mark
│                             │
│         Sign In             │ ← H5 (1.25rem) instead of H4
│                             │
│  ┌─────────────────────────┐ │
│  │ Email Address        [×]│ │ ← Cleaner input with clear icon
│  └─────────────────────────┘ │
│                             │
│  ┌─────────────────────────┐ │
│  │ Password            [👁]│ │ ← Password toggle
│  └─────────────────────────┘ │
│                             │
│  ┌─────────────────────────┐ │
│  │      SIGN IN            │ │ ← Consistent button height
│  └─────────────────────────┘ │
│                             │
│     Don't have an account?  │ ← Smaller, muted text
│         Sign Up             │
│                             │
│  ────────────────────────── │
│                             │
│       Admin Dashboard       │ ← De-emphasized
│                             │
└─────────────────────────────┘
```

**Key Changes:**
- H5 heading (1.25rem) instead of H4 (1.75rem)
- Consistent 16px base font size
- Better spacing ratios (8px, 16px, 24px, 32px)
- Touch-friendly button height (48px minimum)

---

## 🎨 **WIREFRAME 2: Assessment Page (Mobile)**

```
┌─────────────────────────────┐
│ CredAhead          Level 3  │ ← Compact nav with level
├─────────────────────────────┤
│ Question 5 of 24            │ ← Body text (0.9rem)
│ ████████░░░░░░░ 33%         │ ← Progress bar
├─────────────────────────────┤
│                             │
│ What is the primary purpose │ ← H6 (1.1rem) for questions
│ of financial literacy       │   
│ education?                  │
│                             │
│ ○ To learn investment       │ ← Radio buttons with
│   strategies                │   proper spacing
│                             │
│ ○ To understand basic       │
│   money management          │
│                             │
│ ○ To become a financial     │
│   advisor                   │
│                             │
│ ○ To avoid paying taxes     │
│                             │
│                             │
│      [SUBMIT ANSWER]        │ ← Centered, prominent
│                             │
│                             │
│ Difficulty: 4.2             │ ← Small metadata
└─────────────────────────────┘
```

**Key Changes:**
- Question text: H6 (1.1rem) instead of H6 (1.25rem)
- Better line height (1.5) for readability
- Consistent option spacing
- Metadata moved to bottom, de-emphasized

---

## 🎨 **WIREFRAME 3: Demographics Survey (Mobile)**

```
┌─────────────────────────────┐
│ CredAhead              [←]  │ ← Back button
├─────────────────────────────┤
│                             │
│    Welcome to CredAhead!    │ ← H5 (1.25rem)
│                             │
│   Help us personalize your  │ ← Body (0.9rem)
│      experience             │
│                             │
│ ●●○ Step 2 of 3             │ ← Visual progress dots
│                             │
│ ┌─────────────────────────┐ │
│ │ Age Range            [v]│ │ ← Dropdown with icon
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Location (City/Town)    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ Occupation           [v]│ │
│ └─────────────────────────┘ │
│                             │
│                             │
│ ┌─────────────────────────┐ │
│ │    CONTINUE TO ASSESSMENT│ │ ← Clear action
│ └─────────────────────────┘ │
│                             │
│   Your information is secure│ ← Fine print (0.8rem)
└─────────────────────────────┘
```

**Key Changes:**
- Progress dots instead of bar for simpler visual
- Cleaner form layout with consistent spacing
- Better hierarchy between title, subtitle, and body text

---

## 🎨 **WIREFRAME 4: Admin Dashboard (Mobile)**

```
┌─────────────────────────────┐
│ Admin Dashboard        [☰]  │ ← Hamburger for mobile menu
├─────────────────────────────┤
│ Overview | Import | Content │ ← Scrollable tabs
├─────────────────────────────┤
│                             │
│ ┌──────┐ ┌──────┐           │ ← 2x2 grid on mobile
│ │  📚  │ │  ❓  │           │   instead of 4x1
│ │  12  │ │ 245  │           │
│ │Lesson│ │Quest.│           │
│ └──────┘ └──────┘           │
│                             │
│ ┌──────┐ ┌──────┐           │
│ │  👥  │ │  📊  │           │
│ │   6  │ │  18  │           │
│ │Users │ │Sessio│           │
│ └──────┘ └──────┘           │
│                             │
│ Recent Users                │ ← Section headers (H6)
│ ┌─────────────────────────┐ │
│ │ john@email.com    Lvl 3 │ │ ← Simplified table
│ │ jane@email.com    Lvl 1 │ │
│ │ mike@email.com    Lvl 5 │ │
│ └─────────────────────────┘ │
│                             │
│          [VIEW ALL]         │ ← Action button
└─────────────────────────────┘
```

**Key Changes:**
- 2x2 stat cards instead of 4x1 row
- Simplified card content
- Better section organization
- Mobile-optimized table layout

---

## 📐 **Typography Scale Proposal:**

```
Mobile Typography Hierarchy:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

H4: 1.5rem   (24px) - Page titles only
H5: 1.25rem  (20px) - Section headers  
H6: 1.125rem (18px) - Subsections
Body: 0.875rem (14px) - Main content
Small: 0.75rem (12px) - Metadata/captions
Button: 0.875rem (14px) - Button text

Line Heights:
- Headings: 1.2
- Body text: 1.5
- Buttons: 1.4
```

---

## 🎯 **Design Principles:**

1. **Touch-First**: 44px minimum touch targets
2. **Scannable**: Clear visual hierarchy
3. **Efficient**: Information density optimized for mobile
4. **Consistent**: 8px spacing grid throughout
5. **Professional**: Clean, modern aesthetic

---

## 🔧 **Implementation Strategy:**

1. Create consistent spacing variables
2. Implement refined typography scale
3. Optimize component layouts for mobile
4. Add proper touch targets
5. Test on actual devices

Would you like me to proceed with implementing these wireframe designs?