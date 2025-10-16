# Theme Customization Guide

This template uses Tailwind CSS with CSS variables for theming, making it easy to customize colors and branding.

## Quick Customization

### 1. Update Colors

Edit `src/index.css` to change the color scheme. The template uses HSL color values for easy customization.

#### Light Mode Colors
```css
:root {
  --primary: 221.2 83.2% 53.3%;        /* Main brand color */
  --primary-foreground: 210 40% 98%;    /* Text on primary color */
  --secondary: 210 40% 96.1%;           /* Secondary elements */
  --destructive: 0 84.2% 60.2%;         /* Error/delete actions */
  --background: 0 0% 100%;              /* Page background */
  --foreground: 222.2 84% 4.9%;         /* Main text color */
  /* ... other colors */
}
```

#### Quick Color Presets

**Blue Theme (Default)**
```css
--primary: 221.2 83.2% 53.3%;
```

**Green Theme**
```css
--primary: 142 71% 45%;
```

**Purple Theme**
```css
--primary: 262 83% 58%;
```

**Orange Theme**
```css
--primary: 25 95% 53%;
```

### 2. Update Branding

#### Application Name
Edit `src/components/Layout.tsx` line 24:
```tsx
<Link to="/dashboard" className="text-xl font-bold text-primary">
  Your App Name  {/* Change this */}
</Link>
```

#### Page Titles
Update page titles in:
- `src/pages/Dashboard.tsx` - Main workflow page
- `src/pages/Settings.tsx` - Settings page
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Signup page

### 3. Logo

To add a logo:

1. Place your logo file in `src/assets/logo.png` (or .svg)
2. Update `src/components/Layout.tsx`:

```tsx
import logo from '../assets/logo.png'

// In the Layout component:
<div className="flex items-center gap-2">
  <img src={logo} alt="Logo" className="h-8 w-8" />
  <span className="text-xl font-bold text-primary">Your App Name</span>
</div>
```

### 4. Favicon

Replace `public/vite.svg` with your own favicon.

For multiple favicon formats:
1. Add favicon files to `public/` directory
2. Update `index.html`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
```

### 5. Fonts

#### Using Google Fonts

1. Add to `index.html` in the `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. Update `tailwind.config.js`:
```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
}
```

### 6. Border Radius

Update border radius throughout the app in `src/index.css`:

```css
:root {
  --radius: 0.5rem;  /* Default rounded corners */
}

/* For sharper corners: */
--radius: 0.25rem;

/* For more rounded: */
--radius: 0.75rem;

/* For fully rounded: */
--radius: 1rem;
```

## Advanced Customization

### Dark Mode

The template includes dark mode support. To toggle between light/dark:

1. Add a theme toggle button in `src/components/Layout.tsx`:

```tsx
import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

// In Layout component:
const [isDark, setIsDark] = useState(false)

useEffect(() => {
  const root = window.document.documentElement
  root.classList.toggle('dark', isDark)
}, [isDark])

// Add this button in the navigation:
<Button
  variant="ghost"
  size="sm"
  onClick={() => setIsDark(!isDark)}
>
  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
</Button>
```

### Custom Components

All UI components are in `src/components/ui/`. You can:
- Modify existing components
- Add new variants
- Adjust spacing and sizing

Example - Adding a new button variant:
```tsx
// In src/components/ui/button.tsx
const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  // Add your custom variant:
  brand: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90",
}
```

### Workflow Page Customization

The `src/pages/Dashboard.tsx` file contains example form controls. Customize it by:

1. **Change form fields** - Add/remove inputs based on your n8n workflow
2. **Update validation** - Modify react-hook-form validation rules
3. **Customize result display** - Change how workflow results are shown
4. **Add workflow-specific logic** - Include custom processing before sending to n8n

## Color Palette Reference

The template uses semantic color names that automatically adapt to light/dark mode:

- `primary` - Main brand color, used for CTAs and emphasis
- `secondary` - Secondary actions and backgrounds
- `accent` - Highlights and hover states
- `destructive` - Errors, warnings, and delete actions
- `muted` - Subdued text and disabled elements
- `background` - Page backgrounds
- `foreground` - Main text color
- `border` - Border colors
- `input` - Form input borders

Use these in your components with Tailwind classes:
```tsx
<div className="bg-primary text-primary-foreground">Primary colored</div>
<div className="bg-secondary text-secondary-foreground">Secondary</div>
<button className="bg-destructive text-destructive-foreground">Delete</button>
```

## Tips

- Test your color changes in both light and dark modes
- Ensure sufficient contrast for accessibility
- Use consistent spacing (Tailwind's default scale)
- Keep the design simple for easy duplication across projects
- Document any custom modifications for future reference
