# Second Brain 🧠 - UI/UX Design & Layout Specification

This document provides a comprehensive breakdown of the design system, typography, interactive layouts, UI components, and motion guidelines of the **Second Brain** application.

---

## 🌌 1. Design System & Theme

Second Brain uses a custom **"Deep Space"** aesthetic—a sleek, dark-themed user interface utilizing glassmorphism, vibrant neon accents, responsive layout structures, and smooth micro-animations.

### 🎨 Color Palette
The colors are configured in the design system to resemble a premium dark workspace with high contrast accents:

| Token Name | Hex Code | Tailwind Key | Visual Purpose |
| :--- | :--- | :--- | :--- |
| **Obsidian** | `#050510` | `brain-dark` | Global page background |
| **Electric Azure** | `#00E0FF` | `brain-primary` | Primary highlights, links, focus states, and badges |
| **Electric Azure Dark**| `#00B8CC` | `brain-primary-dark`| Hover/active states of primary elements |
| **Deep Purple** | `#7B61FF` | `brain-secondary` | Secondary gradients and visual accents |
| **Moonlight** | `#E0E7FF` | `brain-text-secondary`| Secondary text labels, subtitles, and icons |
| **Glass Panel** | `rgba(255, 255, 255, 0.03)` | `brain-panel` | Backdrop for containers, cards, and modal sheets |

### 🔳 Shadows & Glows
*   **Neon Glow (`shadow-neon`)**: `0 0 20px rgba(0, 224, 255, 0.3)`
*   **Soft Neon Glow (`shadow-neon-soft`)**: `0 0 12px rgba(0, 224, 255, 0.15)`
*   **Strong Neon Glow (`shadow-neon-strong`)**: `0 0 30px rgba(0, 224, 255, 0.4), 0 0 60px rgba(0, 224, 255, 0.1)`
*   **Glass Panel Shadow (`shadow-glass`)**: `0 8px 32px 0 rgba(0, 0, 0, 0.37)`
*   **Elevated Glass Shadow (`shadow-glass-lg`)**: `0 12px 48px 0 rgba(0, 0, 0, 0.5)`
*   **Inner Glow (`shadow-inner-glow`)**: `inset 0 1px 0 rgba(255, 255, 255, 0.06)`

### 🌌 Visual Accents & Mesh Backgrounds
*   **Grid Grid Overlay**: A fixed, non-interactive overlay pattern of subtle lines:
    ```css
    background-image: 
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), 
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 70px 70px;
    ```
*   **Ambient Glow Orbs (`GlowOrb`)**: Large, absolute-positioned blur nodes rendered behind pages using custom sizes and delayed fade-in animations to add dimension:
    *   *Primary Orb*: Radial gradient (`rgba(0, 224, 255, 0.12)` to `transparent 70%`) with `120px` blur.
    *   *Secondary Orb*: Radial gradient (`rgba(123, 97, 255, 0.12)` to `transparent 70%`) with `120px` blur.
*   **Gradient Text (`.gradient-text`)**: Standard clip-path linear gradient running from Electric Azure to Deep Purple:
    ```css
    background-image: linear-gradient(135deg, #00E0FF, #7B61FF);
    ```

### 🔤 Typography
*   **Font Family**: `Inter`, `system-ui`, `sans-serif` (applied globally for system UI and body texts).
*   **Display Font**: `Inter` with heavy letter tracking modifications (`tracking-tight`) for display headers.

---

## 🧱 2. Global Components & Styling Classes

These design building blocks are declared in `index.css` and reused across pages:

### 📦 Glassmorphism Panels
*   `.glass-panel`:
    *   *Background*: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`
    *   *Backdrop Blur*: `2xl` (`backdrop-filter: blur(40px)`)
    *   *Border*: `1px solid rgba(255, 255, 255, 0.1)`
    *   *Radius*: `1rem (16px)`
    *   *Shadow*: `shadow-glass`
*   `.glass-panel-elevated`:
    *   *Background*: `linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)`
    *   *Shadow*: `shadow-glass-lg`

### ⌨️ Inputs
*   `.glass-input`:
    *   *Background*: `rgba(255, 255, 255, 0.05)`
    *   *Border*: `1px solid rgba(255, 255, 255, 0.1)`
    *   *Focus State*: Borders are replaced by a `ring-2 ring-brain-primary/50` with an outline removal.
    *   *Transition*: `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`

### 🔘 Buttons
*   `btn-primary` (Electric Accent):
    *   *Background*: Solid `#00E0FF` (`brain-primary`)
    *   *Text*: Obsidian `#050510` (`brain-dark`), bold font weight.
    *   *Interactive Transitions*: Scaling changes (`hover:scale-[1.02] active:scale-[0.98]`) and neon shadows (`hover:shadow-neon`).
*   `btn-ghost` (Neutral Action):
    *   *Background*: `rgba(255, 255, 255, 0.05)`
    *   *Border*: `1px solid rgba(255, 255, 255, 0.1)`
    *   *Hover*: Transitions to `rgba(255, 255, 255, 0.1)` background with `hover:scale-[1.02]`.

### 🏷️ Badges & Indicators
*   `.badge-primary`: Light cyan background (`rgba(0, 224, 255, 0.08)`), cyan border, Electric Azure text, bold tracking.
*   `.badge-success`: Light emerald background (`rgba(52, 211, 153, 0.08)`), green border, emerald text.
*   `.status-dot`: Active pulse component with a core dot and a larger outer circle animating via CSS `@keyframes ping` to depict active server connection gateways.

---

## 📑 3. Page Layouts & Wireframe Architectures

### 🏠 A. Landing Page (`LandingPage.jsx`)
The landing page focuses on onboarding and product showcase:
1.  **Navigation Bar (Sticky Header)**:
    *   Fixed at `top-0`, utilizes `backdrop-blur-2xl` and transparent background overlay.
    *   Houses the Second Brain brand mark (logo avatar) on the left, anchor scroll links (`Features`, `How it Works`, `FAQ`) in the center, and Auth actions (`Login`/`Register`) on the right.
    *   *Mobile Navigation*: A sliding drawer panels in from the right edge with a dark blurred backdrop.
2.  **Hero Section**:
    *   Features a large typography block, gradient borders, and animated floating emojis.
    *   Twin CTA buttons: White background primary button (`Get Started Free`) and background-ghost secondary button (`See How It Works`).
    *   Includes animated statistics/trust counters.
3.  **Features Grid**:
    *   A 3-column container showcasing modular cards with hover scales and bottom border highlights.
4.  **Interactive Product Showcase**:
    *   A macOS-style window container demonstrating a live chat simulator.
5.  **FAQ Accordion**:
    *   Uses expandable heights with layout stabilization to prevent scroll jumps.

### 📊 B. Main Dashboard (`Dashboard.jsx`)
The dashboard is split into two primary columns inside a responsive flex/grid structure:
1.  **Header**:
    *   Simpler navigation layout presenting the user's avatar, username, and role with a dedicated logout trigger.
2.  **Sidebar Panel (Left, 3/12 Column Width)**:
    *   **Data Ingestion Card**: Houses the `FileUpload` component with visual border transitions.
    *   **System Status Card**: Renders system indicators for the Neural Engine, Vector DB, and Ingestion Gateway.
3.  **Chat Canvas (Right, 9/12 Column Width)**:
    *   Uses the full remaining screen height to render `ChatInterface`.

### 💬 C. Chat Interface (`ChatInterface.jsx`)
The workspace layout that handles interactive message loops:
1.  **Header Panel**:
    *   Shows active document state, a RAG utility badge, and a "Clear Chat" option.
2.  **Messages Container**:
    *   Scrolls independently with a custom webkit scrollbar.
    *   User messages are aligned right, colored with a dark blue backdrop.
    *   AI messages are aligned left, using a grey panel.
    *   Supports full Markdown parsing (tables, lists, bold accents, formatted blocks).
    *   Includes source citations at the bottom of AI messages.
3.  **Typing Indicator**:
    *   A glass panel container with 3 bouncing dot keyframes to indicate processing.
4.  **Bottom Prompt Box**:
    *   An input field with an Electric Azure send button.

### 📥 D. File Upload Zone (`FileUpload.jsx`)
A modular box that handles drag-and-drop actions:
1.  **Active Dropzone**:
    *   Dashed outline borders that transition to solid cyan and expand with outer shadows when dragging files.
    *   Displays progress indicators and error messages.
2.  **Staged File Card**:
    *   A small card layout that lists file details and contains action buttons to trigger indexing.

---

## 🎬 4. Animation & Motion Guidelines

Animations are driven by **Framer Motion** to deliver a responsive feel.

### 🚀 Standard Motion Presets
*   **`fadeUp` (Content entry)**:
    *   *Hidden*: `{ opacity: 0, y: 30 }`
    *   *Visible*: `{ opacity: 1, y: 0 }`
    *   *Transition*: `duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94]` (Decelerating)
*   **`staggerContainer` (Parent grids)**:
    *   *Hidden*: `{}`
    *   *Visible*: `{ transition: { staggerChildren: 0.1, delayChildren: 0.2 } }`
*   **`scaleIn` (Visual highlights)**:
    *   *Hidden*: `{ opacity: 0, scale: 0.85 }`
    *   *Visible*: `{ opacity: 1, scale: 1 }`
    *   *Transition*: `duration: 0.6, ease: cubic-bezier(0.25, 0.46, 0.45, 0.94)`
*   **`slideFromLeft` / `slideFromRight`**:
    *   Used on the showcase mockup panels to slide in from opposite sides.

### 🔄 Dynamic Keyframes
*   **`float`**: Simulates vertical floating by moving an element `8px` up and down over a `3s` loop.
*   **`bounce-slow`**: Subtle bouncing for badges and status text.
*   **`pulse-ring`**: Expands and fades an outline ring to emphasize active buttons.
