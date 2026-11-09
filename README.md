# FlowOS

A hardware-accelerated web desktop operating system built with React 19, TypeScript (strict mode), Tailwind CSS, Framer Motion, Web Audio API, and IndexedDB.

FlowOS delivers authentic desktop ergonomics inside the browser, synthesizing the design restraint of modern interfaces, the latency optimization of native window compositors, and the technical depth of an engineering operating environment.

---

## Architectural Overview

FlowOS is engineered around an asynchronous micro-kernel pattern inside the browser, decoupling window compositing, process scheduling, storage abstraction, and audio synthesis into independent subsystems.

```
+-----------------------------------------------------------------------+
|                           FlowOS UI Shell                             |
|    Dynamic Island | Launchpad | Desktop Grid | Dock | Control Center  |
+-----------------------------------+-----------------------------------+
                                    |
+-----------------------------------v-----------------------------------+
|                        Core Subsystem Layer                           |
|  WindowManager | ProcessStore | VirtualFileSystem | AudioEngine       |
+---------+-----------------+-------------------+-------------------+---+
          |                 |                   |                   |
          v                 v                   v                   v
+------------------+ +-------------+ +---------------------+ +----------+
| WindowsLayer     | | AppRegistry | | IndexedDB Storage   | | Web Audio|
| (120 FPS Canvas) | | & Lifecycle | | & W3C File Mount    | | DSP Synth|
+------------------+ +-------------+ +---------------------+ +----------+
```

### 1. Decoupled 120 FPS Window Compositor (`WindowsLayer`)
- **Direct GPU Transform Pipeline:** Window drag and resize operations bypass React state reconciliation loops during pointer interactions by piping coordinate deltas directly into DOM transforms via motion values.
- **Reference-Stable Window Tree:** Uses primitive array selectors (`openAppIds: string[]`, `activeWindowId: string`) to prevent React 18 `useSyncExternalStore` and `getSnapshot` reference allocation loops.
- **Top-Right Window Geometry:** Window chrome features standard top-right window controls (Minimize, Maximize/Restore, Close) with high-contrast accessibility outlines and smooth spring dampening.
- **Fault-Tolerant Isolation:** Each window frame is enclosed within a dedicated React `ErrorBoundary` and independent DOM subtree. Uncaught runtime exceptions inside user applications remain isolated without crashing the desktop compositor.

### 2. Desktop Placement Engine & Snapping (`desktopStore`)
- **Dual Placement Topology:**
  - **Fixed Grid Snapping:** Snaps icons to a structured 96x100 pixel grid matrix starting at coordinate `(28, 56)`. Dragging an icon automatically computes the closest column and row cell upon release.
  - **Freeform Placement:** Allows arbitrary pixel positioning anywhere on the desktop canvas with coordinate clamping to viewport boundaries.
- **Auto-Arrange Grid:** Programmatically scans all active shortcuts and desktop files to calculate optimal column-major layout distribution based on dynamic viewport height.
- **Global Deselection Engine:** A high-priority pointer capture listener deselects active desktop icons whenever a click occurs outside `[data-desktop-icon]` elements, providing authentic desktop selection behavior.
- **Launchpad Drag-and-Drop Pinning:** Native HTML5 Drag and Drop pipeline transfers app bundles (`application/flowos-app-id`) directly from the Launchpad app drawer onto the desktop wallpaper.
- **Quick-Pin Action:** Launchpad app cards feature both an inline plus button and a context menu entry to pin applications to the desktop in one click.

### 3. Dynamic Activity Island (Minimal Capsule)
- **Detached Capsule Architecture:** Replaces legacy static menu bars with a floating, centered island pill inspired by modern hardware capsules.
- **Unobtrusive Telemetry:** Houses system time, network connectivity status, battery percentage, active Pomodoro focus countdowns, and animated equalizer waves when audio is playing.
- **Quick Hub Integration:** Clicking the Dynamic Island summons the Control Center glass panel without obscuring the desktop surface.

### 4. Adaptive Icon Silhouette & Window Materiality
- **Geometric Icon Morphing:** The desktop shell, dock, and launchpad adapt icon geometry dynamically according to user preferences:
  - **Squircle:** Standard Apple iOS curvature (`rounded-[22.5%]`).
  - **Circle:** Minimal geometric circle (`rounded-full`).
  - **Rounded:** macOS Big Sur super-ellipse tile (`rounded-lg`).
  - **Smooth:** Soft ergonomic pill silhouette (`rounded-2xl`).
- **Dynamic Window Materials:**
  - **Frosted Liquid Glass:** Backdrop blur with high-luminance specular borders and ambient light transmission.
  - **Opaque Solid Matte:** Pure jet-black surface (`bg-[#0c0d12]`) designed for high-contrast viewing and zero GPU blur overhead.
  - **Translucent Film:** Lightweight semi-transparent polymer tint with variable opacity slider ($50\% \to 100\%$).

### 5. Fluid Dock & Process Lifecycle Tracking
- **Lifecycle Differentiation:** The dock distinguishes between active running windows, minimized windows, and closed applications.
  - **Minimized Windows:** Indicated by an amber status pip (`bg-amber-400/90`). Clicking a minimized dock item restores the window directly to the foreground.
  - **Terminated Applications:** Closing a window cleanly terminates its process ID, fully removing running indicator dots from the dock.
- **Smart Auto-Hide:** Automatically slides below the viewport edge when overlapping active windows are present and reveals smoothly on bottom-edge hover.
- **Aero Peek Hover:** Hovering over running dock icons renders miniature thumbnail cards and gently ghosts inactive windows (`opacity: 0.15`).

### 6. Storage & Virtual File System (VFS)
- **IndexedDB POSIX Abstraction:** Directory trees, file metadata, permissions, and binary blobs persist locally across browser sessions.
- **Physical Host PC Mounting:** Connects real directories from the physical computer directly into the FlowOS VFS under `/device/{folderName}` via the W3C File System Access API.
- **Host Bridge Drag-and-Drop:** Dragging files from the native operating system desktop directly onto FlowOS imports them into `/home/user/Desktop`. Right-clicking any VFS node provides instant physical download to the host machine.
- **Batch Renamer Studio (`F2`):** Multi-file renaming engine supporting find-and-replace, regex patterns, prefix/suffix insertion, and sequential numbering with live diff preview.

### 7. Procedural Web Audio Engine
- **Zero Asset Synthesis:** Complete sound subsystem synthesized purely with the Web Audio API without downloading external audio files:
  - Procedural soundscapes: Gentle Rain, Campfire Crackle, White Noise, Deep Space Drone, Brown Noise ($1/f^2$), Server Room Hum, and 40 Hz Gamma Waves.
  - Acoustic keyboard profiles: Mechanical Thock, Nothing Micro-Tick, and 8-Bit Retro Arcade attached to global keystrokes.
- **Pocket Synth & Beat Machine:** Polyphonic 2-octave synthesizer with selectable waveforms, 16-step drum sequencer, and real-time 256-FFT CRT time-domain oscilloscope.
- **Flow Tape Cassette Recorder:** Dual-reel voice recorder with responsive ballistic analog VU needle meters and WebM audio export.

---

## Application Catalog

| Application | Process ID | Category | Description |
| :--- | :--- | :--- | :--- |
| **Personal OS** | `personal-os` | Productivity | Engineering workstation featuring dynamic DSA problem tracking, algorithmic momentum engine, missions, project architecture studio, git diff viewer, and academic attendance monitors. |
| **Browser** | `browser` | Productivity | Sandboxed multi-tab browser with direct iframe embed, Jina Reader engine bypass for header-restricted domains, and local file viewer. |
| **Files** | `file-explorer` | Utilities | POSIX file manager with Quick Look file previewer (`Spacebar`), W3C host folder mounting, breadcrumb navigation, and tree hierarchy. |
| **Code Editor** | `code-editor` | Development | Monospaced editor with syntax highlighting, line numbers gutter, and integrated sandboxed WebWorker execution console. |
| **Terminal** | `terminal` | Development | `flowsh` Unix pipeline shell supporting chained pipes (`|`), filters (`grep`, `wc`, `head`, `tail`, `sort`, `uniq`), `tree` visualizer, and Tab autocomplete. |
| **Settings** | `system-settings` | System | Centralized preferences studio controlling theme architecture, desktop grid snapping, icon silhouettes, window materiality, typography, and accessibility. |
| **FlowBoard** | `flowboard` | Productivity | Infinite vector whiteboard canvas with tactile sticky cards, geometric process nodes, connecting bezier vectors, and doodle pen. |
| **FlowShot** | `flowshot` | Productivity | Screen capture and markup studio featuring rectangular marquee cropping, arrows, text annotations, highlighters, and privacy blur tools. |
| **FlowCam** | `flowcam` | Media | Retro photo booth offering zero-latency webcam capture and 6 canvas shaders (Cyberpunk, Amber CRT, GameBoy, Noir 1970s, Vaporwave). |
| **Pocket Synth** | `synth` | Media | Industrial audio workstation featuring a 2-octave polyphonic keyboard, 16-step beat sequencer, DSP low-pass filter, and CRT vector oscilloscope. |
| **Flow Tape** | `flowtape` | Media | Tactile cassette deck with rotating reels, analog ballistic VU needle meters, variable pitch playback, and audio export. |
| **Flow 2048** | `retro-2048` | Games | 4x4 sliding tile puzzle with keyboard controls, procedural Web Audio clicks, and persistent high-score tracking. |
| **FlowSweeper** | `retro-sweeper` | Games | Minimalist minesweeper featuring classic logic, safe first-click assurance, flag markers, and completion timer. |
| **CyberPong** | `cyber-pong` | Games | 2-player local split-keyboard and AirBridge P2P table tennis with particle effects and CRT court glow. |
| **Snake Arena** | `snake-arena` | Games | 2-player Tron lightcycle grid clash with local duel controls, pathfinding bot, and collision physics. |
| **Connect 4** | `connect-four` | Games | Tactical gravity grid with pass-and-play local duel, Minimax heuristic bot, and move undo. |
| **App Store** | `app-store` | Utilities | Application marketplace to discover, install, manage packages, and package arbitrary URLs as desktop PWAs. |
| **Gallery** | `gallery` | Media | High-resolution image browser with pan, zoom, rotation, and automated slideshow mode. |
| **Activity Monitor**| `task-manager` | System | Process manager displaying CPU utilization sparklines, memory allocation, and process management. |
| **Calculator** | `calculator` | Utilities | Arithmetic calculator with persistent calculation tape, chained calculations, and percentage modes. |
| **Music Player** | `music` | Media | Audio player with procedural synth compositions and 60 FPS multi-band FFT frequency analyzer. |
| **Notes** | `notes` | Productivity | Markdown notebook with tag organization, reading time estimators, and live preview rendering. |
| **FlowPaint** | `paint` | Productivity | Canvas drawing studio with pens, brushes, color palettes, and direct PNG export to `/home/user/Pictures`. |

---

## Global Keyboard Shortcuts

| Shortcut | Scope | Function |
| :--- | :--- | :--- |
| `Spacebar` | Files / Desktop | Trigger Quick Look modal for selected file |
| `F2` | Files | Open Smart Batch Renamer Studio |
| `Shift + Drag` | Window Header | Summon FancyZones spatial window snapping overlay |
| `Alt + A` | Global | Open Launchpad Mobile App Library |
| `Alt + S` | Global | Toggle Stage Manager spatial window strip |
| `Alt + T` | Global | Tile top two focused windows in split-screen view |
| `Alt + C` / `Ctrl + Shift + C` | Global | Toggle Control Center quick settings panel |
| `Ctrl + K` / `Cmd + K` | Global | Open Raycast Spotlight with search and inline calculator |
| `Ctrl + J` / `Cmd + J` | Global | Toggle AI Copilot assistant sidecar drawer |
| `Ctrl + \` | Global | Toggle Quick Scratchpad drawer |
| `Ctrl + Shift + V` | Global | Open Clipboard History popover |
| `Ctrl + Shift + S` / `PrintScreen` | Global | Summon FlowShot screen capture marquee |
| `Ctrl + Up` / `Cmd + Up` | Global | Open Mission Control workspaces overview |
| `Ctrl + 1` .. `4` | Global | Switch to Workspace 1, 2, 3, or 4 |
| `Alt + Tab` | Global | Open Task Switcher and cycle active windows |
| `Ctrl + Alt + L` | Global | Lock screen and engage secure enclave |
| `Alt + [` / `Alt + Left` | Active Window | Tile window to left 50% split |
| `Alt + ]` / `Alt + Right`| Active Window | Tile window to right 50% split |
| `Alt + Enter` / `Alt + Up` | Active Window | Toggle window maximize / restore |
| `Ctrl + S` / `Cmd + S` | Code / Notes | Save buffer directly to VFS |
| `Tab` | Terminal | Autocomplete commands and file system paths |
| `Esc` | Global | Dismiss active modal, menu, or search overlay |

---

## Development Setup

### System Requirements
- Node.js version 18.0.0 or higher
- npm or pnpm package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/Dhyanesh2603/MyOs.git
cd MyOs

# Install project dependencies
npm install

# Launch Vite development server
npm run dev
```

The development server initializes by default on `http://localhost:3000/`.

### Verification & Production Build
```bash
# Run strict TypeScript validation and production bundle
npm run build
```

FlowOS compiles with zero TypeScript errors under strict type checking (`strict: true`, `noUncheckedIndexedAccess: true`).

---

## Native Platform Deployment Roadmap

FlowOS is architected with a decoupled display, state, and subsystem topology. Below is the technical specification for deploying FlowOS as a native desktop environment or standalone operating system on physical hardware.

```
+------------------------------------------------------------------------+
|                        FlowOS UI & Window Shell                        |
|                (React 19 + Framer Motion + Tailwind CSS)               |
+-----------------------------------+------------------------------------+
                                    |
           +------------------------+------------------------+
           v                                                 v
+-------------------------------+         +-------------------------------+
|     TIER 1: DESKTOP SHELL     |         |     TIER 2: WAYLAND SYSTEM    |
|  Tauri v2 / Electron Bridge   |         |    Smithay Compositor (Rust)  |
+-------------------------------+         +-------------------------------+
| - Windows: Winlogon Shell     |         | - Direct DRM/KMS Rendering    |
|   (Replaces explorer.exe)     |         | - Native Wayland sub-surfaces |
| - Linux: X11/i3/Xinit Session |         |   (Firefox, VSCode, Alacritty)|
| - Real PTY / Terminal IO      |         | - D-Bus / systemd daemon sync |
| - Native FS & Process Spawning|         | - Hardware accelerated EGL    |
+-------------------------------+         +-------------------------------+
                                                           |
                                                           v
                                          +-------------------------------+
                                          |      TIER 3: BARE-METAL OS    |
                                          |     FlowOS Linux Distribution |
                                          +-------------------------------+
                                          | - Linux Kernel LTS (x86_64)   |
                                          | - Minimal init (BusyBox/Alpine)|
                                          | - Direct boot to FlowOS shell |
                                          | - Instant 3-second cold boot  |
                                          +-------------------------------+
```

### Architectural Tiers

1. **Tier 1: Native Desktop Shell (Tauri v2 + Rust Bridge)**
   - Package FlowOS into a lightweight desktop runtime powered by Tauri v2 and native system webviews (WebView2 on Windows, WebKitGTK on Linux).
   - Windows Shell Replacement: Configure Windows Registry key `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell = "C:\FlowOS\flowos.exe"` to boot FlowOS directly instead of `explorer.exe`.
   - Real Terminal IO: Bridge `flowsh` directly to Windows PowerShell or Linux bash via Rust PTY bindings (`portable-pty`).
   - Memory footprint: Approximately 35 MB binary, 80 MB idle RAM.

2. **Tier 2: Linux Wayland Compositor**
   - FlowOS operates as a Wayland Compositor utilizing Rust Smithay or C wlroots.
   - Intercepts native Linux GUI applications (`code`, `chrome`, `alacritty`) and paints surfaces inside FlowOS DOM window frames.
   - Hardware integration: D-Bus bindings for NetworkManager, BlueZ Bluetooth, and PipeWire audio.

3. **Tier 3: Standalone Bare-Metal Operating System**
   - Independent bootable Linux distribution based on an LTS kernel and minimal Alpine root filesystem.
   - Boot chain: UEFI -> Linux Kernel -> Minimal init -> Direct KMS/DRM rendering of the FlowOS shell.
   - Boots directly from hardware initialization in approximately 3 seconds without legacy desktop environments.

---

## License

This project is licensed under the MIT License.
