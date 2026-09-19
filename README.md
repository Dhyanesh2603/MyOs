# FlowOS

A flagship, hardware-accelerated web desktop operating system built with React 19, TypeScript (strict mode), Tailwind CSS, Framer Motion, and IndexedDB.

FlowOS delivers authentic desktop ergonomics inside the browser, marrying the restraint and precision of **Linear**, the speed of **Raycast**, the workspaces of **Arc**, the developer friendliness of **Warp**, and the typography of **Nothing OS**.

---

## 🌟 Key Features & Core Subsystems

### 1. Interactive Desktop Widgets & Ambient Layer
- **Live Widgets:** Analog/digital clock, real-time telemetry (CPU & memory sparklines), rich sticky notes with editable color cards, live weather forecasts, and ambient media player controls.
- **Collapsible Widget Drawer:** Slide-out right-edge drawer to toggle, configure, and reorder desktop widgets on the fly.
- **Draggable Freeform Layout:** Position widgets anywhere on the desktop canvas with coordinate persistence across sessions.

### 2. macOS-Style Control Center Glass Shade
- **Quick Settings Matrix:** One-click toggles for Wi-Fi, Bluetooth, AirDrop, Do Not Disturb, and Dark Mode with smooth glassmorphic active states.
- **Real Display Brightness & Night Shift:** Native viewport filter pipeline adjusting true screen brightness ($10\% \to 100\%$) and warm amber blue-light filtering ($0\% \to 100\%$).
- **Master Audio Slider & Now Playing Card:** Fluid sliders for system volume and media track playback controls.

### 3. Multi-Desktop Virtual Workspaces (Spaces) & Mission Control
- **Dynamic Spaces:** Switch between up to 4 isolated virtual workspaces (`Desktop 1`, `Work`, `Dev`, `Media`) with independent window stacks.
- **Workspace Switcher Pills:** Minimal pill indicator in the global menu bar with live active workspace tracking.
- **Mission Control (`Ctrl + Up`):** Bird's-eye window overview displaying scaled, interactive miniature cards of all open windows across workspaces.
- **Hotkeys:** `Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3`, `Ctrl + 4` for instant workspace jumps.

### 4. Dock Miniature Hover Previews & Window Aero Peek
- **Miniature Hover Cards:** Hovering over any running dock icon reveals an interactive thumbnail preview card with window title and quick close/focus actions.
- **Aero Peek Ghosting:** Hovering over a preview card instantly ghosts all other windows on screen (`opacity: 0.15`, `blur: 1px`), bringing the target window into crisp visual focus.

### 5. System Clipboard History Manager (`Ctrl + Shift + V`)
- **Raycast-Style Floating Manager:** Global popover tracking recent clipboard history across text, code snippets, URLs, and hex color codes.
- **Live Color & Syntax Badges:** Automatic syntax highlighting detection for code and inline color swatch previews for CSS hex colors.
- **Pinning & Quick Search:** Filter clipboard items in real-time or pin important snippets permanently.

### 6. In-Browser Sandboxed Code Execution Engine
- **WebWorker Sandbox:** Run JavaScript/TypeScript code directly in the browser with infinite loop timeouts and safe console logging.
- **Code Editor Console Drawer:** Integrated slide-up terminal console in the Code Editor app displaying execution output, return values, errors, and execution duration.
- **Terminal CLI Integration:** Run files or one-liners directly from the terminal via `run <filename>` or `eval <code>`.

### 7. FlowShot Screen Capture & Markup Studio (`Ctrl + Shift + S`)
- **Crop Marquee & Fullscreen Capture:** High-contrast crosshair selection overlay with pixel dimensions and one-click fullscreen snap.
- **Tactile Markup Studio:** Built-in editing suite featuring freehand pens, arrows, rectangular outlines, text labels, highlighter markers, and privacy blur tools.
- **Instant VFS Export:** Save annotated screenshots directly to `/home/user/Pictures/FlowShot_*.png` with desktop notification alerts.

### 8. Universal Full-Text Search & VFS Content Indexer
- **Deep File Inspection in Spotlight (`Ctrl + K`):** Indexes and searches the contents of all documents, code files, notes, and configs across the IndexedDB virtual file system.
- **Keyword Snippets & Line Numbers:** Displays matched lines with highlighted keyword occurrences directly in the command palette search results.

### 9. Flow Package Manager & GUI Flow App Store
- **Flow App Store:** Sleek desktop marketplace to browse, discover, install, and uninstall community applications with one click.
- **Community App Catalog:**
  - 🌧️ **Matrix Rain:** Cyberpunk falling code digital rain simulator with customizable speed and green phosphor glow.
  - 📖 **Markdown Reader:** Split-pane formatted markdown documentation viewer with table-of-contents navigation.
  - ⚡ **Benchmarker:** Browser compute & memory benchmark stress tester with real-time score gauges.
- **Terminal Package CLI:** Full package management via terminal commands (`pkg list`, `pkg install <id>`, `pkg remove <id>`, `pkg search <query>`).

### 10. Dynamic Generative Wallpapers & Screensaver
- **60 FPS Canvas Shaders:** Real-time procedural wallpapers including **Starfield 3D Warp**, **Matrix Phosphor Rain**, and **Audio Reactive Waves**.
- **Ambient Screensaver:** Minimalist Nothing OS-inspired ambient clock screensaver with customizable idle activation timer.

### 11. Complete System Image Backup & Instant State Restore Engine
- **`.flowos` System Archives:** Export your entire operating system state—including IndexedDB file tree, installed packages, custom themes, wallpapers, and window layouts—into a single portable JSON archive.
- **One-Click Restore:** Drag or upload any `.flowos` archive via the Flow Menu to instantly restore your workspace state.

### 12. Unified Global Top Menu Bar & System Tray
- **FlowOS System Menu:** Apple-style logo dropdown (*About FlowOS*, *System Preferences*, *Activity Monitor*, *Export System Image*, *Restore Backup*, *Screensaver*, *Lock Screen*).
- **Dynamic Contextual App Menus:** Menu bar (`File`, `Edit`, `Window`, `Help`) dynamically adapts in real time to the currently focused application.
- **Interactive System Tray:** Live battery percentage & charging indicator (Web Battery API), Wi-Fi status, master sound volume toggle, quick theme switcher (Dark Obsidian $\leftrightarrow$ Light Daylight), and live clock with an interactive monthly calendar popover.

### 13. Window Manager & Aero Snap Split-Screen Tiling
- **Edge Proximity Snapping:** Drag any window titlebar to the left or right screen edge to trigger an animated frosted snap preview outline; release to tile into an exact 50% split-screen half. Drag to the top to maximize.
- **Aero Snap Hotkeys:**
  - `Alt + [` or `Alt + ArrowLeft`: Snap focused window to left half.
  - `Alt + ]` or `Alt + ArrowRight`: Snap focused window to right half.
  - `Alt + Enter` or `Alt + ArrowUp`: Toggle maximize / restore.
- **Zero-Lag Pointer Capture:** `setPointerCapture` prevents cursor slippage during rapid dragging across iframes and canvases.
- **8-Axis Resizing:** Invisible, high-precision resize frame with 4 corner and 4 edge handles.
- **Bounded Focus Stack:** Deterministic Z-index allocation (`BASE_Z_INDEX + focusIndex`) preventing infinite z-index drift.

### 14. Host PC File Bridge (Drag-and-Drop & Native Download)
- **Host Drag-and-Drop:** Drag physical files, images, or code from Windows Explorer directly into the browser surface or File Explorer to import them into `/home/user/Desktop` in the virtual file system.
- **Native Export to PC:** Right-click any file in File Explorer or Desktop $\to$ select **"Download to PC"** to save it directly to your physical Downloads folder.

### 15. Ambient Lock Screen & Session Auth (`Win + L`)
- **Nothing OS Typography:** Ambient typography clock, live date, encrypted enclave status, and user avatar.
- **Tactile PIN Authentication:** 4-digit PIN authentication (default: `1234`) with on-screen keypad and physical keyboard input.
- **Lock Hotkey:** `Ctrl + Alt + L` or `Meta + L` locks the session immediately.

### 16. Tactile Web Audio UI Soundscape
- **Procedural Synthesizer:** Zero external audio assets required. Synthesizes subtle mechanical clicks, low-frequency window snap resonance chimes, and alert tones directly via the Web Audio API.
- **Master Mute:** Instant toggle from the System Tray sound icon.

---

## 📱 Built-in & Community Applications

| Application | ID | Category | Description |
| :--- | :--- | :--- | :--- |
| **Browser** | `browser` | Productivity | Sandboxed in-OS web browser with multi-tabs, URL/search omnibox, and quick bookmarks (MDN, GitHub, HN, Wikipedia). |
| **Files** | `file-explorer` | Utilities | Arc-style Workspace sidebar, breadcrumbs, high-density table/grid views, VFS file creation/deletion, and host export. |
| **Code Editor** | `code-editor` | Development | Monospaced editor with line numbers gutter, syntax detection, `Ctrl+S` VFS save, and integrated WebWorker execution console. |
| **Notes** | `notes` | Productivity | Obsidian-inspired markdown notes with `#tags`, word count, reading time, edit vs reading view, and VFS file loading. |
| **Terminal** | `terminal` | Development | `flowsh` shell with execution cards, duration timers, POSIX commands, package manager (`pkg`), and code execution (`run`, `eval`). |
| **FlowShot** | `flowshot` | Productivity | Screen capture and tactile markup studio with arrows, boxes, text, highlighters, blur tool, and direct export. |
| **FlowPaint** | `paint` | Productivity | Tactile canvas drawing studio with pens, brushes, highlighters, color swatches, undo, and direct save to `/home/user/Pictures`. |
| **App Store** | `app-store` | Utilities | Discover, install, and manage extensible community packages with one-click installation and status management. |
| **Gallery** | `gallery` | Media | High-res photo browser with zoom, 90° rotation, automated slideshow mode, and bottom thumbnail carousel. |
| **Activity Monitor** | `task-manager` | System | Real-time CPU & RSS memory telemetry cards, interactive process table, process kill actions, and system inode counters. |
| **Calculator** | `calculator` | Utilities | Tactile keypad with expression history tape, chained calculations, percentage, floating-point precision, and isolated keyboard handling. |
| **Music Player** | `music` | Media | Procedural Web Audio synthesizer tracks and real-time 60 FPS FFT frequency visualizer. |
| **Settings** | `system-settings` | System | Linear Personalization Studio with live accent color swatches, window radius slider ($8\text{px} \to 28\text{px}$), dynamic canvas wallpapers, and screensaver configuration. |
| **Matrix Rain** *(Community)* | `matrix-rain` | Utilities | Cyberpunk phosphor code waterfall visualizer with interactive stream density controls. |
| **Markdown Reader** *(Community)* | `markdown-viewer` | Productivity | Fast documentation and markdown reader with sidebar heading outline. |
| **Benchmarker** *(Community)* | `benchmarker` | Utilities | Multi-threaded browser performance benchmarker evaluating V8 execution speed and memory allocations. |

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global | Open Raycast Spotlight Command Palette (App search & Full-Text VFS Search) |
| `Ctrl + Shift + V` | Global | Open Raycast-style System Clipboard History Popover |
| `Ctrl + Shift + S` / `PrintScreen` | Global | Launch FlowShot Screen Capture Marquee Overlay |
| `Ctrl + Up` / `Cmd + Up` | Global | Toggle Mission Control Spaces Overview |
| `Ctrl + 1` .. `4` | Global | Switch to Workspace Space 1, 2, 3, or 4 |
| `Alt + Tab` | Global | Open Task Switcher & cycle running windows |
| `Ctrl + Alt + L` | Global | Lock Screen & activate secure enclave |
| `Alt + [` / `Alt + ←` | Active Window | Snap window to left 50% split screen |
| `Alt + ]` / `Alt + →` | Active Window | Snap window to right 50% split screen |
| `Alt + Enter` / `Alt + ↑` | Active Window | Toggle window maximize / restore |
| `Ctrl + S` / `Cmd + S` | Code / Notes | Save active file directly to VFS |
| `Esc` | Modals | Close Command Palette, Menus, FlowShot, or Calendar |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/Dhyanesh2603/MyOs.git
cd MyOs

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser.

### Production Build & Typecheck
```bash
npm run build
```
FlowOS enforces strict TypeScript type safety (`strict: true`, `noUncheckedIndexedAccess: true`, `0 errors`).
