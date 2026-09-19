# FlowOS

A flagship, hardware-accelerated web desktop operating system built with React 19, TypeScript (strict mode), Tailwind CSS, Framer Motion, and IndexedDB.

FlowOS delivers authentic desktop ergonomics inside the browser, marrying the restraint and precision of **Linear**, the speed of **Raycast**, the workspaces of **Arc**, the developer friendliness of **Warp**, and the typography of **Nothing OS**.

---

## 🌟 Key Features & Core Subsystems

### 1. macOS-Style Quick Look File Previewer (`Spacebar`)
- **Instant File Inspection:** Select any file in File Explorer or Desktop and press `Spacebar` to instantly summon the floating Quick Look modal without launching heavyweight apps.
- **Rich Content Renderers:**
  - Formatted markdown documents with typography styling.
  - Syntax-highlighted code files with monospaced line numbering.
  - Hi-res image inspector with pan/zoom and dimensions.
  - Interactive audio waveform player with play/pause and progress scrubbing.
  - Formatted JSON / plain text tree viewer.
- **Header Metadata & App Routing:** Displays filename, humanized byte size, MIME category, and an **"Open with [App]"** primary button routing directly to Code Editor, Notes, Gallery, or Browser.

### 2. Dynamic Island & Live Activity Capsule (Top Menu Bar)
- **Fluid Morphing Capsule:** Centered in the global menu bar, this Nothing / Apple-inspired capsule animates with fluid spring physics between collapsed pill and active state.
- **Multi-Subsystem Telemetry:** Automatically responds to:
  - **Music Player:** Real-time track title, artist, and animated multi-band equalizer waves.
  - **Pomodoro Timer:** Live countdown timer pill with pulsing status indicator.
  - **Lo-Fi Soundscapes:** Active ambient noise generator indicator (Rain, Campfire, Deep Space).
- **Interactive Expanded HUD:** Hovering over the Dynamic Island expands an interactive glass HUD card allowing users to pause/skip music, toggle Pomodoro sessions, or switch ambient noise on the fly.

### 3. Stage Manager & Spatial Window Clusters (`Alt + S`)
- **Spatial Window Staging:** Tucks non-active background windows into a vertical stage strip along the left edge of the desktop, keeping the primary workspace completely distraction-free.
- **Interactive Thumbnails:** Hovering over any staged thumbnail highlights the application, while clicking brings that window cluster smoothly back to center stage.
- **Quick Toggles:** Instantly enable or disable Stage Manager using the `Alt + S` global hotkey or the dedicated **"Stage Mgr"** switch tile in the macOS Control Center shade.

### 4. Pocket Synth & Beat Machine (Teenage Engineering OP-1 Aesthetic)
- **Tactile Industrial Workstation:** Dieter Rams / OP-1 inspired matte-stone aesthetic with tactile buttons, rotary sliders, and phosphor LED indicators.
- **2-Octave Polyphonic Synthesizer:** Playable with mouse, touch, or computer keyboard (`A, W, S, E, D, F, G, H, J, K...`) with selectable waveforms (`sine`, `square`, `sawtooth`, `triangle`) and octave shifting.
- **16-Step Drum Sequencer:** 4 independent synthesized percussion tracks (**Kick**, **Snare**, **Hi-Hat**, **Clap**) with zero external audio assets, adjustable BPM (60 - 180), and traveling playhead LEDs.
- **Built-in Groove Presets:** Instant loading for **Lo-Fi Lounge**, **Electro Wave**, and **Minimal Techno** patterns.
- **Live Vector CRT Oscilloscope:** Real-time 256-FFT time-domain canvas oscilloscope visualizer rendering high-contrast neon phosphor waveforms.
- **Tactile DSP Effects:** Adjustable Low-Pass Biquad Filter cutoff and Echo / Delay feedback loops.

### 5. Raycast AI Copilot Sidecar & Spotlight Math Engine (`Ctrl + J` & `Ctrl + K`)
- **Slide-out AI Copilot Drawer:** Triggered via `Ctrl + J` / `Cmd + J` or the top menu bar Sparkles icon. Inspects active window titles, process telemetry, and VFS contexts.
- **Workflow Prompt Chips:** Instant actions for code explanation, terminal script generation, sprint note drafting, and system health diagnostics.
- **Spotlight Inline Calculator:** Typing arithmetic queries (e.g., `45 * 12`, `sqrt(144)`, `20% of 150`, `2^10`) directly into Spotlight (`Ctrl + K`) generates real-time computed results with one-click clipboard copying.

### 6. Lo-Fi Ambient Soundscapes & Focus Pomodoro Timer
- **Procedural Soundscape Synthesizer:** Pure mathematical Web Audio generators with zero external sound files: **Gentle Rain**, **Campfire Crackle**, **White Noise**, and **Deep Space Ambient Drone**.
- **Control Center Integration:** Integrated soundscape selector cards with live volume adjustment in the macOS-style Control Center.
- **Top Bar Pomodoro Timer:** Minimalist focus pill with 25-min focus / 5-min break / 15-min rest cycles, acoustic completion chimes, and automatic toast notifications.

### 7. 1-Click Custom Web App Creator (PWA Packager)
- **Universal URL Packager:** Turn any website or local server URL (e.g. Figma, Excalidraw, Spotify, GitHub, YouTube) into an isolated FlowOS windowed app.
- **Custom App Manifests:** Customize app name, category, icon glyph, and accent color.
- **Auto Desktop & Dock Deployment:** Automatically pins created applications to the Dock and Desktop, persisted in browser storage.

### 8. Retro Arcade Suite (Flow 2048 & FlowSweeper)
- **Flow 2048:** Tactile 4x4 sliding tile numerical puzzle with keyboard arrow support, Web Audio haptic clicks and snap chimes, and persistent high score tracking.
- **FlowSweeper:** Minimalist Dieter Rams / Nothing OS Minesweeper with safe first-click guarantee, interactive smiley face button, flag markers (`🚩`), and timer.

### 9. Interactive Desktop Widgets & Ambient Layer
- **Live Widgets:** Analog/digital clock, real-time telemetry (CPU & memory sparklines), rich sticky notes with editable color cards, live weather forecasts, and ambient media player controls.
- **Collapsible Widget Drawer:** Slide-out right-edge drawer to toggle, configure, and reorder desktop widgets on the fly.
- **Draggable Freeform Layout:** Position widgets anywhere on the desktop canvas with coordinate persistence across sessions.

### 10. macOS-Style Control Center Glass Shade
- **Quick Settings Matrix:** One-click toggles for Wi-Fi, Bluetooth, Host Bridge, Focus (DND), Stage Manager, and AI Copilot with smooth glassmorphic active states.
- **Real Display Brightness & Night Shift:** Native viewport filter pipeline adjusting true screen brightness ($10\% \to 100\%$) and warm amber blue-light filtering ($0\% \to 100\%$).
- **Master Audio Slider & Now Playing Card:** Fluid sliders for system volume and media track playback controls.

### 11. Multi-Desktop Virtual Workspaces (Spaces) & Mission Control
- **Dynamic Spaces:** Switch between up to 4 isolated virtual workspaces (`Desktop 1`, `Work`, `Dev`, `Media`) with independent window stacks.
- **Workspace Switcher Pills:** Minimal pill indicator in the global menu bar with live active workspace tracking.
- **Mission Control (`Ctrl + Up`):** Bird's-eye window overview displaying scaled, interactive miniature cards of all open windows across workspaces.
- **Hotkeys:** `Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3`, `Ctrl + 4` for instant workspace jumps.

### 12. Dock Miniature Hover Previews & Window Aero Peek
- **Miniature Hover Cards:** Hovering over any running dock icon reveals an interactive thumbnail preview card with window title and quick close/focus actions.
- **Aero Peek Ghosting:** Hovering over a preview card instantly ghosts all other windows on screen (`opacity: 0.15`, `blur: 1px`), bringing the target window into crisp visual focus.

### 13. System Clipboard History Manager (`Ctrl + Shift + V`)
- **Raycast-Style Floating Manager:** Global popover tracking recent clipboard history across text, code snippets, URLs, and hex color codes.
- **Live Color & Syntax Badges:** Automatic syntax highlighting detection for code and inline color swatch previews for CSS hex colors.
- **Pinning & Quick Search:** Filter clipboard items in real-time or pin important snippets permanently.

### 14. In-Browser Sandboxed Code Execution Engine
- **WebWorker Sandbox:** Run JavaScript/TypeScript code directly in the browser with infinite loop timeouts and safe console logging.
- **Code Editor Console Drawer:** Integrated slide-up terminal console in the Code Editor app displaying execution output, return values, errors, and execution duration.
- **Terminal CLI Integration:** Run files or one-liners directly from the terminal via `run <filename>` or `eval <code>`.

### 15. FlowShot Screen Capture & Markup Studio (`Ctrl + Shift + S`)
- **Crop Marquee & Fullscreen Capture:** High-contrast crosshair selection overlay with pixel dimensions and one-click fullscreen snap.
- **Tactile Markup Studio:** Built-in editing suite featuring freehand pens, arrows, rectangular outlines, text labels, highlighter markers, and privacy blur tools.
- **Instant VFS Export:** Save annotated screenshots directly to `/home/user/Pictures/FlowShot_*.png` with desktop notification alerts.

### 16. Universal Full-Text Search & VFS Content Indexer
- **Deep File Inspection in Spotlight (`Ctrl + K`):** Indexes and searches the contents of all documents, code files, notes, and configs across the IndexedDB virtual file system.
- **Keyword Snippets & Line Numbers:** Displays matched lines with highlighted keyword occurrences directly in the command palette search results.

### 17. Flow Package Manager & GUI Flow App Store
- **Flow App Store:** Sleek desktop marketplace to browse, discover, install, and uninstall community applications with one click.
- **Community App Catalog:**
  - 🌧️ **Matrix Rain:** Cyberpunk falling code digital rain simulator with customizable speed and green phosphor glow.
  - 📖 **Markdown Reader:** Split-pane formatted markdown documentation viewer with table-of-contents navigation.
  - ⚡ **Benchmarker:** Browser compute & memory benchmark stress tester with real-time score gauges.
- **Terminal Package CLI:** Full package management via terminal commands (`pkg list`, `pkg install <id>`, `pkg remove <id>`, `pkg search <query>`).

### 18. Dynamic Generative Wallpapers & Screensaver
- **60 FPS Canvas Shaders:** Real-time procedural wallpapers including **Starfield 3D Warp**, **Matrix Phosphor Rain**, and **Audio Reactive Waves**.
- **Ambient Screensaver:** Minimalist Nothing OS-inspired ambient clock screensaver with customizable idle activation timer.

### 19. Complete System Image Backup & Instant State Restore Engine
- **`.flowos` System Archives:** Export your entire operating system state—including IndexedDB file tree, installed packages, custom themes, wallpapers, and window layouts—into a single portable JSON archive.
- **One-Click Restore:** Drag or upload any `.flowos` archive via the Flow Menu to instantly restore your workspace state.

### 20. Host PC File Bridge (Drag-and-Drop & Native Download)
- **Host Drag-and-Drop:** Drag physical files, images, or code from Windows Explorer directly into the browser surface or File Explorer to import them into `/home/user/Desktop` in the virtual file system.
- **Native Export to PC:** Right-click any file in File Explorer or Desktop $\to$ select **"Download to PC"** to save it directly to your physical Downloads folder.

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
| **Flow 2048** | `retro-2048` | Utilities | Tactile 4x4 sliding tile numerical puzzle with procedural Web Audio feedback and score tracking. |
| **FlowSweeper** | `retro-sweeper` | Utilities | Minimalist tactile Minesweeper with classic logic, safe first clicks, and clean geometry. |
| **FlowPaint** | `paint` | Productivity | Tactile canvas drawing studio with pens, brushes, highlighters, color swatches, undo, and direct save to `/home/user/Pictures`. |
| **App Store** | `app-store` | Utilities | Discover, install, and manage extensible community packages with one-click installation and PWA web app creator. |
| **Gallery** | `gallery` | Media | High-res photo browser with zoom, 90° rotation, automated slideshow mode, and bottom thumbnail carousel. |
| **Activity Monitor** | `task-manager` | System | Real-time CPU & RSS memory telemetry cards, interactive process table, process kill actions, and system inode counters. |
| **Calculator** | `calculator` | Utilities | Tactile keypad with expression history tape, chained calculations, percentage, floating-point precision, and isolated keyboard handling. |
| **Music Player** | `music` | Media | Procedural Web Audio synthesizer tracks and real-time 60 FPS FFT frequency visualizer. |
| **Pocket Synth** | `synth` | Media | Teenage Engineering OP-1 aesthetic synthesizer, 2-octave keyboard, 16-step beat sequencer, and CRT oscilloscope. |
| **Settings** | `system-settings` | System | Linear Personalization Studio with live accent color swatches, window radius slider ($8\text{px} \to 28\text{px}$), dynamic canvas wallpapers, and screensaver configuration. |
| **Matrix Rain** *(Community)* | `matrix-rain` | Utilities | Cyberpunk phosphor code waterfall visualizer with interactive stream density controls. |
| **Markdown Reader** *(Community)* | `markdown-viewer` | Productivity | Fast documentation and markdown reader with sidebar heading outline. |
| **Benchmarker** *(Community)* | `benchmarker` | Utilities | Multi-threaded browser performance benchmarker evaluating V8 execution speed and memory allocations. |

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Spacebar` | File Explorer / Desktop | Open macOS-style Quick Look File Previewer Modal |
| `Alt + S` | Global | Toggle Stage Manager Spatial Window Clusters & Left Strip |
| `Ctrl + K` / `Cmd + K` | Global | Open Raycast Spotlight Command Palette (App search, VFS Full-Text Search, and Inline Math Calculations) |
| `Ctrl + J` / `Cmd + J` | Global | Toggle Raycast AI Copilot Intelligence Sidecar Drawer |
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
| `Esc` | Modals | Close Command Palette, Menus, FlowShot, Copilot, Quick Look, or Calendar |

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
