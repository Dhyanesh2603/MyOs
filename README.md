# FlowOS

A flagship, hardware-accelerated web desktop operating system built with React 19, TypeScript (strict mode), Tailwind CSS, Framer Motion, and IndexedDB.

FlowOS delivers authentic desktop ergonomics inside the browser, marrying the restraint and precision of **Linear**, the speed of **Raycast**, the workspaces of **Arc**, the developer friendliness of **Warp**, and the typography of **Nothing OS**.

---

## 🌟 Key Features & Core Subsystems

### 1. Unified Global Top Menu Bar & System Tray
- **FlowOS System Menu:** Apple-style logo dropdown (*About FlowOS*, *System Preferences*, *Activity Monitor*, *Lock Screen*, *Restart*).
- **Dynamic Contextual App Menus:** Menu bar (`File`, `Edit`, `Window`, `Help`) dynamically adapts in real time to the currently focused application.
- **Interactive System Tray:** Live battery percentage & charging indicator (Web Battery API), Wi-Fi status, master sound volume toggle, quick theme switcher (Dark Obsidian $\leftrightarrow$ Light Daylight), and live clock with an interactive monthly calendar popover.
- **Top Clearance:** Geometry insets (`top: 32px`) ensure all windows cascade and maximize beneath the system bar.

### 2. Window Manager & Aero Snap Split-Screen Tiling
- **Edge Proximity Snapping:** Drag any window titlebar to the left or right screen edge to trigger an animated frosted snap preview outline; release to tile into an exact 50% split-screen half. Drag to the top to maximize.
- **Aero Snap Hotkeys:**
  - `Alt + [` or `Alt + ArrowLeft`: Snap focused window to left half.
  - `Alt + ]` or `Alt + ArrowRight`: Snap focused window to right half.
  - `Alt + Enter` or `Alt + ArrowUp`: Toggle maximize / restore.
- **Zero-Lag Pointer Capture:** `setPointerCapture` prevents cursor slippage during rapid dragging across iframes and canvases.
- **8-Axis Resizing:** Invisible, high-precision resize frame with 4 corner and 4 edge handles.
- **Bounded Focus Stack:** Deterministic Z-index allocation (`BASE_Z_INDEX + focusIndex`) preventing infinite z-index drift.

### 3. Host PC File Bridge (Drag-and-Drop & Native Download)
- **Host Drag-and-Drop:** Drag physical files, images, or code from Windows Explorer directly into the browser surface or File Explorer to import them into `/home/user/Desktop` in the virtual file system.
- **Native Export to PC:** Right-click any file in File Explorer or Desktop $\to$ select **"Download to PC"** to save it directly to your physical Downloads folder.

### 4. Ambient Lock Screen & Session Auth (`Win + L`)
- **Nothing OS Typography:** Ambient typography clock, live date, encrypted enclave status, and user avatar.
- **Tactile PIN Authentication:** 4-digit PIN authentication (default: `1234`) with on-screen keypad and physical keyboard input.
- **Lock Hotkey:** `Ctrl + Alt + L` or `Meta + L` locks the session immediately.

### 5. Tactile Web Audio UI Soundscape
- **Procedural Synthesizer:** Zero external audio assets required. Synthesizes subtle mechanical clicks, low-frequency window snap resonance chimes, and alert tones directly via the Web Audio API.
- **Master Mute:** Instant toggle from the System Tray sound icon.

### 6. Universal File Association Engine
- **System-Wide Extension Routing:**
  - `.md`, `.txt`, `.log` $\to$ **Notes**
  - `.json`, `.js`, `.ts`, `.sh`, `.css`, `.html`, `.env` $\to$ **Code Editor**
  - `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif` $\to$ **Gallery**
  - `.mp3`, `.wav`, `.ogg` $\to$ **Music Player**
- Double-clicking any file on the Desktop or in File Explorer automatically resolves its default app and loads the file directly from the VFS.

### 7. Virtual File System (VFS)
- Fully asynchronous POSIX-like file tree (`/home/user/...`) backed by browser **IndexedDB** (`FlowOS_Storage`).
- Persists user files, notes, code, and sketches across browser reloads.

### 8. Fluid Magnetic Dock
- Physics-based magnification curve calculated via GPU springs (`useSpring`, `useMotionValue`) with zero React re-render overhead.
- Running process dot indicators and window minimizing/restoring states.

### 9. Raycast Spotlight Command Palette (`Ctrl + K`)
- Search and launch all 11 built-in applications.
- Switch wallpapers, clean up windows, and trigger system operations with keyboard navigation (`↑`, `↓`, `↵`, `Esc`).

### 10. Dynamic Theme Token Engine
- Real-time CSS variable manipulation (`--surface-canvas`, `--content-primary`, `--accent-primary`) with zero component re-renders.
- Includes **Dark Obsidian**, **Light Daylight**, and custom accent palettes (Indigo, Emerald, Amber, Rose, Cyan, Monochrome).

---

## 📱 Built-in Applications (11 Apps)

| Application | ID | Category | Description |
| :--- | :--- | :--- | :--- |
| **Browser** | `browser` | Productivity | Sandboxed in-OS web browser with multi-tabs, URL/search omnibox, and quick bookmarks (MDN, GitHub, HN, Wikipedia). |
| **Files** | `file-explorer` | Utilities | Arc-style Workspace sidebar, breadcrumbs, high-density table/grid views, VFS file creation/deletion, and host export. |
| **Code Editor** | `code-editor` | Development | Monospaced editor with line numbers gutter, syntax detection badges (JSON, TS, JS, Shell, CSS), `Ctrl+S` VFS save, and line/col telemetry. |
| **Notes** | `notes` | Productivity | Obsidian-inspired markdown notes with `#tags`, word count, reading time, edit vs reading view, and VFS file loading. |
| **Terminal** | `terminal` | Development | `flowsh` shell with Warp-inspired execution cards, command duration timers, and POSIX commands (`ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `ps`, `kill`, `clear`). |
| **FlowPaint** | `paint` | Productivity | Tactile canvas drawing studio with pens, brushes, highlighters, color swatches, undo, and direct save to `/home/user/Pictures`. |
| **Gallery** | `gallery` | Media | High-res photo browser with zoom, 90° rotation, automated slideshow mode, and bottom thumbnail carousel. |
| **Activity Monitor** | `task-manager` | System | Real-time CPU & RSS memory telemetry cards, interactive process table, process kill actions, and system inode counters. |
| **Calculator** | `calculator` | Utilities | Tactile keypad with expression history tape, chained calculations, percentage, floating-point precision, and isolated keyboard handling. |
| **Music Player** | `music` | Media | Procedural Web Audio synthesizer tracks and real-time 60 FPS FFT frequency visualizer. |
| **Settings** | `system-settings` | System | Linear Personalization Studio with live accent color swatches, window radius slider ($8\text{px} \to 28\text{px}$), and wallpaper switcher. |

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Global | Open Raycast Spotlight Command Palette |
| `Alt + Tab` | Global | Open Task Switcher & cycle running windows |
| `Ctrl + Alt + L` | Global | Lock Screen & activate secure enclave |
| `Alt + [` / `Alt + ←` | Active Window | Snap window to left 50% split screen |
| `Alt + ]` / `Alt + →` | Active Window | Snap window to right 50% split screen |
| `Alt + Enter` / `Alt + ↑` | Active Window | Toggle window maximize / restore |
| `Ctrl + S` / `Cmd + S` | Code / Notes | Save active file directly to VFS |
| `Esc` | Modals | Close Command Palette, Menus, or Calendar |

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
