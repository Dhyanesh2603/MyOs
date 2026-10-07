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
  - **Ambient Soundscapes:** Active ambient noise indicator with live waveform visualizer bars.
- **Interactive Expanded HUD:** Hovering over the Dynamic Island expands an interactive glass HUD card allowing users to pause/skip music, toggle Pomodoro sessions, or switch ambient soundscape tracks on the fly.

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

### 5. Raycast Spotlight Dev Tools & Inline Calculator (`Ctrl + K`)
- **Slide-out AI Copilot Drawer:** Triggered via `Ctrl + J` or the top menu bar Sparkles icon. Inspects active window titles, process telemetry, and VFS contexts.
- **Spotlight Inline Calculator:** Typing arithmetic queries (e.g., `45 * 12`, `sqrt(144)`, `20% of 150`, `2^10`) directly into Spotlight generates real-time computed results with one-click clipboard copying.
- **Spotlight Dev Tools:** Type slash commands and utilities directly in the command palette:
  - `/deepwork`, `/mission`, `/priority`, `/scratch` — quick navigation shortcuts
  - `base64 <text>` — encode/decode instantly
  - `uuid` — generate RFC 4122 UUID
  - `timestamp` — current Unix epoch
  - `hex #rrggbb` — hex color to RGB
  - `<n>px`, `<n>hz`, `<n>bytes` — CSS/engineering unit conversions

### 6. Deep Work Ambient Soundscape Engine
- **Procedural Soundscape Synthesizer:** Pure mathematical Web Audio generators with zero external sound files:
  - **Gentle Rain** — layered filtered noise bursts
  - **Campfire Crackle** — randomized impulse crackle chain
  - **White Noise** — flat-spectrum broadband noise
  - **Deep Space Drone** — slow beating sub-oscillators
  - **Brown Noise** — Brownian motion synthesis ($1/f^2$ slope)
  - **Server Room Hum** — 60 Hz / 120 Hz data center ambience with fan noise
  - **40 Hz Gamma Waves** — isochronic carrier for cognitive deep focus
- **Reactive Store Sync:** `ambientSoundStore` (Zustand) reflects engine state in real time via pub-sub — zero polling.
- **Focus Mode Integration:** Ambient soundscape selector rail with Mute control appears inside the full-screen Focus Mode overlay.
- **Control Center Integration:** Integrated soundscape selector with live volume adjustment.

### 7. Arc-Style Interactive Split-Screen Tiling (`Alt + T`)
- **One-Shortcut Tiling:** Press `Alt + T` to instantly snap the two most recently focused windows into a synchronized side-by-side split layout.
- **Draggable Live Divider:** Drag the center divider handle to rebalance the split ratio in real time; ratio badge displays live percentage.
- **Double-Click Reset:** Double-click the divider to snap back to an equal 50/50 split with a spring animation.
- **Clamped Split Range:** Neither panel can shrink below 20% of viewport width — enforced by `[0.2, 0.8]` ratio clamping.
- **Auto-Dissolve:** The tiling layout automatically dissolves when either window is closed or minimized.

### 8. Quick Scratchpad Drawer (`Ctrl + \`)
- **Instant Slide-In Drawer:** Summon a persistent scratchpad from any context without opening an app, triggered by `Ctrl + \` or the System Tray pen icon.
- **Three Modes:**
  - **Notes** — freeform markdown with live preview toggle
  - **Code** — 7-language code buffer (JS, TS, Python, Bash, Rust, Go, SQL)
  - **History** — searchable audit trail of all scratchpad entries
- **Personal OS Promotion Rail:** One-click buttons to send scratchpad content directly into Personal OS as a new Mission, Project Issue, or DSA Mistake Note.

### 9. 1-Click Custom Web App Creator (PWA Packager)
- **Universal URL Packager:** Turn any website or local server URL (e.g. Figma, Excalidraw, Spotify, GitHub, YouTube) into an isolated FlowOS windowed app.
- **Custom App Manifests:** Customize app name, category, icon glyph, and accent color.
- **Auto Desktop & Dock Deployment:** Automatically pins created applications to the Dock and Desktop, persisted in browser storage.

### 10. Retro Arcade Suite (Flow 2048 & FlowSweeper)
- **Flow 2048:** Tactile 4x4 sliding tile numerical puzzle with keyboard arrow support, Web Audio haptic clicks and snap chimes, and persistent high score tracking.
- **FlowSweeper:** Minimalist Dieter Rams / Nothing OS Minesweeper with safe first-click guarantee, interactive smiley face button, flag markers (🚩), and timer.

### 11. Interactive Desktop Widgets & Ambient Layer
- **Live Widgets:** Analog/digital clock, real-time telemetry (CPU & memory sparklines), rich sticky notes with editable color cards, live weather forecasts, and ambient media player controls.
- **Collapsible Widget Drawer:** Slide-out right-edge drawer to toggle, configure, and reorder desktop widgets on the fly.
- **Draggable Freeform Layout:** Position widgets anywhere on the desktop canvas with coordinate persistence across sessions.

### 12. macOS-Style Control Center Glass Shade
- **Quick Settings Matrix:** One-click toggles for Wi-Fi, Bluetooth, Host Bridge, Focus (DND), Stage Manager, and AI Copilot with smooth glassmorphic active states.
- **Real Display Brightness & Night Shift:** Native viewport filter pipeline adjusting true screen brightness ($10\% \to 100\%$) and warm amber blue-light filtering ($0\% \to 100\%$).
- **Master Audio Slider & Now Playing Card:** Fluid sliders for system volume and media track playback controls.

### 13. Multi-Desktop Virtual Workspaces (Spaces) & Mission Control
- **Dynamic Spaces:** Switch between up to 4 isolated virtual workspaces (`Desktop 1`, `Work`, `Dev`, `Media`) with independent window stacks.
- **Workspace Switcher Pills:** Minimal pill indicator in the global menu bar with live active workspace tracking.
- **Mission Control (`Ctrl + Up`):** Bird's-eye window overview displaying scaled, interactive miniature cards of all open windows across workspaces.
- **Hotkeys:** `Ctrl + 1`, `Ctrl + 2`, `Ctrl + 3`, `Ctrl + 4` for instant workspace jumps.

### 14. Dock Smart Auto-Hide & Bottom Reveal
- **Full-Screen Window Expansion:** All standard app windows auto-launch maximized to fill the entire browser viewport.
- **Smart Dock Auto-Hide:** When any non-minimized window is open, the dock automatically hides beneath the viewport edge.
- **1-Second Bottom Hover Intent:** Move the cursor to the bottom edge for 1 second to reveal the centered floating dock with a spring slide-up animation.
- **Centered Floating Design:** Dock is always horizontally centered regardless of viewport width using Framer Motion spring physics.

### 15. Dock Miniature Hover Previews & Window Aero Peek
- **Miniature Hover Cards:** Hovering over any running dock icon reveals an interactive thumbnail preview card with window title and quick close/focus actions.
- **Aero Peek Ghosting:** Hovering over a preview card instantly ghosts all other windows on screen (`opacity: 0.15`, `blur: 1px`), bringing the target window into crisp visual focus.

### 16. System Clipboard History Manager (`Ctrl + Shift + V`)
- **Raycast-Style Floating Manager:** Global popover tracking recent clipboard history across text, code snippets, URLs, and hex color codes.
- **Live Color & Syntax Badges:** Automatic syntax highlighting detection for code and inline color swatch previews for CSS hex colors.
- **Pinning & Quick Search:** Filter clipboard items in real-time or pin important snippets permanently.

### 17. In-Browser Sandboxed Code Execution Engine
- **WebWorker Sandbox:** Run JavaScript/TypeScript code directly in the browser with infinite loop timeouts and safe console logging.
- **Code Editor Console Drawer:** Integrated slide-up terminal console in the Code Editor app displaying execution output, return values, errors, and execution duration.
- **Terminal CLI Integration:** Run files or one-liners directly from the terminal via `run <filename>` or `eval <code>`.

### 18. FlowShot Screen Capture & Markup Studio (`Ctrl + Shift + S`)
- **Crop Marquee & Fullscreen Capture:** High-contrast crosshair selection overlay with pixel dimensions and one-click fullscreen snap.
- **Tactile Markup Studio:** Built-in editing suite featuring freehand pens, arrows, rectangular outlines, text labels, highlighter markers, and privacy blur tools.
- **Instant VFS Export:** Save annotated screenshots directly to `/home/user/Pictures/FlowShot_*.png` with desktop notification alerts.

### 19. Enhanced VFS Terminal Shell — Unix Pipeline Edition
- **Unix-Style Pipe Engine:** Chain commands with `|` — e.g. `cat notes.txt | grep TODO | wc -l`.
- **Pipeline-Compatible Filter Commands:** `grep <pattern>`, `wc [-l|-w|-c]`, `head [n]`, `tail [n]`, `sort`, `uniq`, `tr <from> <to>`.
- **Visual Directory Tree (`tree`):** Renders the full VFS directory tree with ASCII art connectors (`├──`, `└──`, `│`) up to 5 levels deep.
- **Smart Tab Autocomplete:** Interactive Tab key completion for shell commands and relative/absolute VFS file paths with common prefix resolution.
- **Command History:** Arrow Up and Arrow Down keys traverse recent command history buffer.

### 20. Universal Full-Text Search & VFS Content Indexer
- **Deep File Inspection in Spotlight (`Ctrl + K`):** Indexes and searches the contents of all documents, code files, notes, and configs across the IndexedDB virtual file system.
- **Keyword Snippets & Line Numbers:** Displays matched lines with highlighted keyword occurrences directly in the command palette search results.

### 21. Flow Package Manager & GUI Flow App Store
- **Flow App Store:** Sleek desktop marketplace to browse, discover, install, and uninstall community applications with one click.
- **Community App Catalog:**
  - 🌧️ **Matrix Rain:** Cyberpunk falling code digital rain simulator with customizable speed and green phosphor glow.
  - 📖 **Markdown Reader:** Split-pane formatted markdown documentation viewer with table-of-contents navigation.
  - ⚡ **Benchmarker:** Browser compute & memory benchmark stress tester with real-time score gauges.
- **Terminal Package CLI:** Full package management via terminal commands (`pkg list`, `pkg install <id>`, `pkg remove <id>`, `pkg search <query>`).

### 22. Dynamic Generative Wallpapers & Screensaver
- **60 FPS Canvas Shaders:** Real-time procedural wallpapers including **Starfield 3D Warp**, **Matrix Phosphor Rain**, and **Audio Reactive Waves**.
- **Ambient Screensaver:** Minimalist Nothing OS-inspired ambient clock screensaver with customizable idle activation timer.

### 23. Complete System Image Backup & Instant State Restore Engine
- **`.flowos` System Archives:** Export your entire operating system state—including IndexedDB file tree, installed packages, custom themes, wallpapers, and window layouts—into a single portable JSON archive.
- **One-Click Restore:** Drag or upload any `.flowos` archive via the Flow Menu to instantly restore your workspace state.

### 24. Host PC File Bridge (Drag-and-Drop & Native Download)
- **Host Drag-and-Drop:** Drag physical files, images, or code from Windows Explorer directly into the browser surface or File Explorer to import them into `/home/user/Desktop` in the virtual file system.
- **Native Export to PC:** Right-click any file in File Explorer or Desktop → select **"Download to PC"** to save it directly to your physical Downloads folder.

### 25. FlowCam Retro Photo Booth
- **Real-Time Viewfinder & Live Shaders:** Zero-latency webcam capture with 6 instant retro canvas shaders:
  - **Natural Crisp:** True-to-life balanced optical capture.
  - **Cyberpunk Neon:** High-saturation chromatic neon glow with cyan-magenta bias.
  - **Amber Phosphor CRT:** 1980s amber monitor scanlines with horizontal raster sweeps.
  - **GameBoy LCD:** 4-shade olive green 8-bit matrix pixelation.
  - **Vintage Noir (1970s):** High-contrast silver halide monochrome with analog film grain.
  - **Vaporwave Glitch:** Chromatic aberration RGB split with retro aesthetic.
- **Tactile Shutter & Photo Reel:** 3-second countdown timer, screen flash burst animation, mechanical shutter click, and bottom filmstrip carousel saving directly to `/home/user/Pictures`.

### 26. FlowDrop Spatial AirBridge Radar
- **Spatial Device Beacon:** AirDrop-inspired radial pulse radar modal scanning for nearby active devices across the local AirBridge network.
- **Simulated P2P Discovery:** Automatically detects and displays simulated nearby devices with battery status and signal strength.
- **Fluid Transmission Beam:** Beam files, photos, or documents to any target node with animated sending progress rings, transmission chimes, and system notifications.

### 27. Flow Tape Cassette Voice Recorder
- **Dieter Rams & Teenage Engineering Aesthetic:** Tactile cassette deck with rotating dual tape reels, matte textured shell, and orange accent buttons.
- **Analog VU Needle Meter:** Responsive ballistic analog needle gauges displaying real-time microphone decibels with peak LEDs.
- **Waveform Visualizer & Speed Controls:** 128-FFT audio time-domain display, variable playback pitch speeds ($0.5\times, 1.0\times, 1.5\times, 2.0\times$), and one-click WebM audio export to `/home/user/Audio`.

### 28. FancyZones Spatial Window Snapping (`Shift + Drag`)
- **PowerToys-Inspired Spatial Tiling:** Hold `Shift` while dragging any window header to summon an interactive spatial zone wireframe overlay.
- **Adaptive 3-Column Layouts:** Dynamic left (28%), center (44%), and right (28%) docking regions with glowing accent boundaries.
- **Magnetic Snapping & Tactile Audio:** Releasing over a highlighted zone instantly snaps and docks the window to the exact layout boundary with a tactile acoustic snap.

### 29. System Typography & Dynamic UI Scale Engine
- **Global Typography Switcher:** Switch between 5 high-grade typographic styles on the fly:
  - **Geist:** Modern engineering elegance.
  - **Inter:** Crisp Swiss utilitarian clarity.
  - **JetBrains Mono:** Code-focused monospaced geometry.
  - **Space Grotesk:** Quirky retro-futuristic proportions.
  - **Nothing DotMatrix:** Teenage Engineering / Nothing OS matrix aesthetic.
- **Global UI Density Scaler:** Smooth zoom scaling ($85\% \to 120\%$) across all windows, menus, widgets, and dock elements with dynamic CSS variable remounting.

### 30. Smart Batch Renamer Studio (`F2`)
- **Multi-File Batch Operations:** Select multiple files in File Explorer and press `F2` to summon the dedicated Batch Renamer Studio.
- **Live Before-and-After Preview:** Real-time diff table previewing updated filenames prior to disk commit.
- **Transform Engines:** Find & Replace, Prefix/Suffix Insertion, Sequential Counter, and Case Conversion.

### 31. Acoustic Keyboard Soundscapes & Audio Profiles
- **Physical Keypress Synthesis:** Web Audio procedural sound generation attached to every keystroke across the operating system.
- **3 Curated Acoustic Themes:** **Mechanical Thock**, **Nothing Micro-Tick**, **8-Bit Retro Arcade**.
- **Control Center Switching:** Switch sound profiles instantly via the macOS Control Center shade.

### 32. FlowBoard Infinite Vector Whiteboard Canvas
- **Infinite Dot-Matrix Surface:** Smooth canvas panning and fluid zoom ($35\% \to 250\%$) with coordinate HUD.
- **Tactile Sticky Notes, Shape Nodes & Connecting Arrows:** Draggable cards, process rectangles, pills, circles, and smart bezier vector arrows.
- **Vector Doodle Pen:** Freehand drawing brush with customizable color swatches and stroke widths.
- **Instant VFS Snapshot Export:** Render the full board and export high-resolution PNG snapshots to `/home/user/Pictures/FlowBoard_*.png`.

### 33. Flow OS v2 — Personal Operating System
- **"What should I work on next?" Momentum Engine:** Intelligent algorithmic prioritization assessing imminent university deadlines, regulatory attendance compliance, active sprint focus, and review queue.
- **Missions as Engineering Campaigns:** Long-term strategic missions with milestones, dependencies, and resources.
- **Deep Engineering Project Studio:** Architecture specs, roadmap milestones, bug log with severity tags, ideas scratchpad, Git commit activity, and release changelogs.
- **Academic Workspace & Compliance Alerts:** Real-time course tracking with bold $\lt 75\%$ mandatory attendance warning banners and interactive CGPA simulator.
- **Career & Placement Command Dashboard:** Visual 6-stage Kanban recruitment pipeline, ATS resume versioning, interview rounds log, and portfolio readiness checklist.
- **Daily Planner & Deep Work Stopwatch:** Morning priorities checklist, Deep Work stopwatch, evening reflections, and focus telemetry.
- **Interactive Vector Knowledge Graph:** High-performance relational vector canvas visualizer interconnecting Projects, Skills, Subjects, Goals, and Companies.
- **Distraction-Free Focus Mode:** One-click full-screen HUD with ambient soundscape selector, countdown timer, and milestone deliverables.

### 34. Project Studio Git Visualizer & Code Diff Viewer
- **Interactive Git Branch & Commit Graph:** Filter across all active branches (`main`, `feat/split-screen`, `feat/terminal-pipes`, `feat/ambient-audio`, `feat/spotlight-dev`) with visual SVG/node timeline connectors (`●───●───●`) and author metadata.
- **Side-by-Side & Unified Diff Modes:** Toggle between **Unified** and **Split** (side-by-side) diff perspectives with dual line numbers.
- **Syntax Highlighting & Patch Colors:** Additions (`+`) rendered in emerald green tint, deletions (`-`) in rose red tint, with context lines in neutral gray.
- **Multi-File Tab Bar:** Fast switching between modified files with live addition (`+48`) and deletion (`-9`) counters.
- **1-Click Copy Patch:** Copy formatted patch contents directly to clipboard with acoustic feedback.
- **Project Studio Integration:** Click the "Git Tree & Diff" button or any individual commit pill in Project Studio to launch the full inspector modal.

### 35. Fully Dynamic & Editable DSA Problem Tracker & Skill Matrix
- **Complete DSA Problem CRUD:**
  - **`+ Add Problem` Modal:** Add questions with Problem Title, Difficulty (*Easy*, *Medium*, *Hard*), Algorithmic Pattern (*Two Pointers*, *Sliding Window*, *Monotonic Stack*, *DP*, *Graphs*, *Trees*, etc.), Platform (*LeetCode*, *Codeforces*, *GFG*), Status (*Solved*, *Review Needed*, *Unsolved*), Time & Space Complexities, and Cognitive Traps / Takeaways.
  - **In-Place Problem Editing (`Pencil`):** Edit any problem's metadata with pre-populated form values.
  - **Problem Deletion (`Trash2`):** Delete entries with immediate reactive state update.
  - **Favorites & Review Queue:** Toggle star favorites and flip status between Solved and Review Flagged.
  - **Inline Architectural Takeaway Drawer:** Expandable mistake notes drawer per question with direct inline editing.
- **Zero Hardcoded Metrics — Fully Dynamic Telemetry:**
  - **Live Interview Readiness %:** Algorithmic calculation based on solved ratio $\min(100, \text{round}((\text{solved} / \text{total}) \times 100))$ with dynamic status assessment.
  - **Dynamic Difficulty Breakdown Bar:** Real-time proportional bar showing Easy, Medium, and Hard counts as questions are added or modified.
  - **Instant Search Bar:** Filter questions in real time by title, pattern, or notes.
- **Skill Matrix Management:**
  - **`+ Add Skill` Modal:** Add engineering skills with Name, Category (*systems*, *frontend*, *backend*, *ai_ml*, *dsa*, *devops*, *architecture*), Proficiency (*beginner* to *mastered*), interactive $0\% \to 100\%$ mastery slider, practice reps, and mastered topic tags.
  - **Skill Editing & Deletion:** In-place edit and delete buttons on every skill card.
  - **Full Persistence:** All additions, edits, and deletions persist across sessions via IndexedDB / `localStorage`.

### 36. Device Storage & Host Machine File Mounting (W3C File System Access API)
- **Direct PC Folder Mounting:** Mount any real physical folder from your host computer directly into FlowOS via the W3C File System Access API (`window.showDirectoryPicker()`) with cross-browser directory input fallback.
- **Unified `/device` VFS Namespace:** Mounted directories and their recursive subtrees are mirrored directly into the VFS under `/device/{folderName}`.
- **Dedicated File Explorer Storage Section:**
  - Sidebar category with live green pulsing connection beacon.
  - One-click **"Mount Local Folder"** and **"Import PC Files"** actions.
  - Active list of mounted host folders with instant unmount buttons.
  - Main viewport header banner with green path indicators and quick empty-state connection prompts.
- **Cross-App Host File Interoperability:** Files in mounted device directories can be inspected in Quick Look (`Spacebar`), edited and saved in Code Editor, formatted in Notes, and previewed in the FlowOS Browser app.

### 37. Multi-Mode Web & Device Browser (Direct Embed + Reader Bypass)
- **Functional In-OS Iframe Browser:** High-performance sandboxed browser engine with multi-tabs, address & search omnibox, and full history traversal (Back, Forward, Reload, Home).
- **Three Specialized Render Modes:**
  - 🌐 **Direct Iframe Embed:** Sandboxed rendering with comprehensive permissions (`allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation`) for iframe-compatible web destinations, docs, and local servers (`localhost:3000`, `localhost:5173`).
  - ⚡ **Jina Reader Engine Bypass:** Seamlessly overcomes `X-Frame-Options` and CSP `frame-ancestors` iframe blocking on sites like GitHub, Wikipedia, blogs, and news via dynamic proxy rendering in `srcDoc` with typography stylesheets.
  - 💻 **Host Device & VFS File Viewer:** Direct access to mounted PC folders (`/device/...`) and individual local files via native file picker, rendering HTML, SVG, Markdown, text, and media inside the browser frame.
- **Smart Connection Fallback:** Bottom status card detecting connection refusal with one-click **"⚡ Switch to Reader Mode"** and **"↗ Open in New Window"** shortcuts.

### 38. Retro Multiplayer Arcade & AirBridge Dual Suite
- **CyberPong Arena (`cyber-pong`):**
  - **Local Split-Keyboard Duel:** 2 players battle simultaneously on the same machine (Player 1: `W / S`, Player 2: `↑ / ↓`).
  - **VS Cyber Bot:** Adaptive AI bot with Easy, Medium, and Hard difficulty levels.
  - **AirBridge P2P Sync:** Zero-latency cross-window / cross-tab multiplayer via `BroadcastChannel` with room code pairing.
  - **Ball Physics & Effects:** Accelerating rally velocity, paddle deflection angles, particle spark bursts, CRT court glow, and synthesized Web Audio sound effects.
- **Snake Arena / Tron Lightcycles (`snake-arena`):**
  - **2-Player Real-Time Grid Battle:** Player 1 (Cyan Lightcycle: `WASD`) vs Player 2 (Amber Lightcycle: `Arrow Keys`).
  - **Collision Rules:** Wall crashes, self-collisions, and tail trapping with pixel explosion feedback.
  - **VS Bot Snake & AirBridge P2P:** Smart pathfinding AI opponent and cross-window real-time multiplayer.
- **Connect 4 Tactical Duel (`connect-four`):**
  - **Turn-Based Gravity Grid (7x6):** Player 1 (Red) vs Player 2 (Yellow).
  - **3 Game Modes:** Pass-and-play local duel, Minimax heuristic AI bot, and AirBridge cross-window P2P sync.
  - **Tactile Board Engine:** Column hover indicators, gravity drop animations, winning 4-in-a-row glowing streak, move undo, and match score counter.

### 39. Dedicated Games Dropdown Menu (Global TopBar)
- **Centralized Arcade Hub:** Positioned directly alongside the Flow Menu in the top navigation bar with a gamepad icon indicator.
- **Categorized Game Collection:** Houses all arcade and multiplayer titles under an organized glass dropdown:
  - 🏓 **CyberPong Arena** (`cyber-pong`) — 2-Player local duel & AirBridge P2P table tennis
  - 🐍 **Snake Arena** (`snake-arena`) — 2-Player Tron lightcycle grid clash
  - 🔴 **Connect 4** (`connect-four`) — Gravity grid duel with Minimax AI
  - 🔢 **Flow 2048** (`retro-2048`) — Tactile sliding tile puzzle
  - 💣 **FlowSweeper** (`retro-sweeper`) — Classic logic minefield
- **Quick-Launch Integration:** One-click launch with acoustic haptic audio and automatic window clustering.

### 40. Zero-Hardcoded Data & Empty-State Onboarding Architecture
- **Clean Slate User Experience:** Complete elimination of artificial dummy data across the entire operating system:
  - **Personal OS:** Starts completely empty with clean empty states across Missions, Projects, Academics, Career Kanban, and DSA Problem Tracker.
  - **Notes & FlowBoard:** Pristine workspace ready for authentic user writing, sketching, and diagramming.
  - **Music Player:** Clean queue with empty-state indicators and direct file import capabilities.
- **Real-Time Algorithmic Derivation:** All metrics (CGPA simulator, attendance alerts, LeetCode interview readiness %, dynamic skill matrix, relational knowledge graphs) are computed purely from live user input.
- **Persistent Local Database (v3):** Schema versioning and migration pipeline storing user data securely across browser sessions via IndexedDB and `localStorage`.

### 41. Fault-Tolerant Shell Architecture & Self-Healing Error Boundaries
- **System-Wide Crash Protection:** Custom React `ErrorBoundary` wrapper deployed across the global desktop shell and individual window frames.
- **Isolated Failure Domains:** If an application encounters a runtime exception, the window frame isolates the error, displays an informative recovery card with reset actions, and prevents the desktop or other running applications from crashing.
- **Null-Safe Media & Hardware Telemetry:** Resilient status parsing across the Control Center Shade, Dynamic Activity Capsule, and Desktop Media Widgets, guaranteeing smooth operation even when media playlists are cleared.
- **Interactive System Tray:** Clickable battery, network, and audio indicators in the menu bar with immediate status overlays.

---

## 📱 Built-in & Community Applications

| Application | ID | Category | Description |
| :--- | :--- | :--- | :--- |
| **Personal OS** | `personal-os` | Productivity | Engineering control center with missions, project studio, git diff viewer, editable DSA tracker, and academics. |
| **Browser** | `browser` | Productivity | Multi-mode in-OS browser with direct iframe embed, Jina Reader bypass for restricted sites, host device file viewer, tabs, and navigation history. |
| **Files** | `file-explorer` | Utilities | Arc-style Workspace sidebar, W3C host device storage mounting (`/device/...`), Quick Look previewer, high-density table/grid views, and host import/export. |
| **CyberPong** | `cyber-pong` | Games | 2-Player multiplayer arcade table tennis with local split-keyboard, AI bot, and AirBridge P2P cross-window sync. |
| **Snake Arena** | `snake-arena` | Games | 2-Player Tron lightcycle grid battle with local split controls, AI bot, and AirBridge P2P cross-window sync. |
| **Connect 4** | `connect-four` | Games | Tactical 2-player multiplayer gravity grid with pass-and-play, Minimax AI bot, and AirBridge P2P sync. |
| **Code Editor** | `code-editor` | Development | Monospaced editor with line numbers gutter, syntax detection, `Ctrl+S` VFS save, and integrated WebWorker execution console. |
| **Notes** | `notes` | Productivity | Obsidian-inspired markdown notes with `#tags`, word count, reading time, edit vs reading view, and VFS file loading. |
| **Terminal** | `terminal` | Development | `flowsh` Unix Pipeline Edition — pipes, `grep`, `wc`, `head`, `tail`, `sort`, `tree`, Tab autocomplete, `eval`, `run`, `pkg`. |
| **FlowShot** | `flowshot` | Productivity | Screen capture and tactile markup studio with arrows, boxes, text, highlighters, blur tool, and direct export. |
| **Flow 2048** | `retro-2048` | Utilities | Tactile 4x4 sliding tile numerical puzzle with procedural Web Audio feedback and score tracking. |
| **FlowSweeper** | `retro-sweeper` | Utilities | Minimalist tactile Minesweeper with classic logic, safe first clicks, and clean geometry. |
| **FlowPaint** | `paint` | Productivity | Tactile canvas drawing studio with pens, brushes, highlighters, color swatches, undo, and direct save to `/home/user/Pictures`. |
| **App Store** | `app-store` | Utilities | Discover, install, and manage extensible community packages with one-click installation and PWA web app creator. |
| **Gallery** | `gallery` | Media | High-res photo browser with zoom, 90° rotation, automated slideshow mode, and bottom thumbnail carousel. |
| **Activity Monitor** | `task-manager` | System | Real-time CPU & RSS memory telemetry cards, interactive process table, and system inode counters. |
| **Calculator** | `calculator` | Utilities | Tactile keypad with expression history tape, chained calculations, percentage, and floating-point precision. |
| **Music Player** | `music` | Media | Procedural Web Audio synthesizer tracks and real-time 60 FPS FFT frequency visualizer. |
| **Pocket Synth** | `synth` | Media | Teenage Engineering OP-1 aesthetic synthesizer, 2-octave keyboard, 16-step beat sequencer, and CRT oscilloscope. |
| **FlowCam** | `flowcam` | Media | Retro photo booth with 6 live shaders (Cyberpunk, Amber CRT, GameBoy, Noir 1970s, Vaporwave), 3s shutter countdown, and photo reel. |
| **Flow Tape** | `flowtape` | Media | Dieter Rams / Teenage Engineering cassette voice recorder with analog ballistic VU meters, rotating reels, and audio export. |
| **FlowBoard** | `flowboard` | Productivity | Infinite vector whiteboard canvas with tactile sticky cards, geometric shape nodes, connecting arrows, and doodle pen. |
| **Settings** | `system-settings` | System | Linear Personalization Studio with live accent color swatches, window radius slider, dynamic canvas wallpapers, and screensaver configuration. |
| **Matrix Rain** *(Community)* | `matrix-rain` | Utilities | Cyberpunk phosphor code waterfall visualizer with interactive stream density controls. |
| **Markdown Reader** *(Community)* | `markdown-viewer` | Productivity | Fast documentation and markdown reader with sidebar heading outline. |
| **Benchmarker** *(Community)* | `benchmarker` | Utilities | Multi-threaded browser performance benchmarker evaluating V8 execution speed and memory allocations. |

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Spacebar` | File Explorer / Desktop | Open macOS-style Quick Look File Previewer Modal |
| `F2` | File Explorer | Open Smart Batch Renamer Studio for selected files |
| `Shift + Drag` | Window Header | Summon FancyZones spatial window snapping wireframe overlay |
| `Alt + S` | Global | Toggle Stage Manager Spatial Window Clusters & Left Strip |
| `Alt + T` | Global | Snap top 2 focused windows into Arc-style split-screen tiling |
| `Ctrl + K` / `Cmd + K` | Global | Open Raycast Spotlight — App search, VFS Full-Text Search, Inline Math & Dev Tools |
| `Ctrl + J` / `Cmd + J` | Global | Toggle Raycast AI Copilot Intelligence Sidecar Drawer |
| `Ctrl + \` | Global | Toggle Quick Scratchpad Drawer (Notes / Code / History) |
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
| `Tab` | Terminal | Autocomplete command names and VFS file/directory paths |
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

---

## 🖥️ Native OS & Desktop Shell Implementation Roadmap

FlowOS is architected with a decoupled display, state, and subsystem topology. Below is the technical specification and scale analysis for deploying FlowOS as a **native desktop environment** or **standalone operating system** on physical Windows and Linux machines.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FlowOS UI & Window Shell                        │
│                (React 19 + Framer Motion + Tailwind CSS)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌───────────────────────────────┐         ┌───────────────────────────────┐
│     TIER 1: DESKTOP SHELL     │         │     TIER 2: WAYLAND SYSTEM    │
│  Tauri v2 / Electron Bridge   │         │    Smithay Compositor (Rust)  │
├───────────────────────────────┤         ├───────────────────────────────┤
│ • Windows: Winlogon Shell     │         │ • Direct DRM/KMS Rendering    │
│   (Replaces explorer.exe)     │         │ • Native Wayland sub-surfaces │
│ • Linux: X11/i3/Xinit Session │         │   (Firefox, VSCode, Alacritty)│
│ • Real PTY / Terminal IO      │         │ • D-Bus / systemd daemon sync │
│ • Native FS & Process Spawning│         │ • Hardware accelerated EGL    │
└───────────────────────────────┘         └───────────────────────────────┘
                                                           │
                                                           ▼
                                          ┌───────────────────────────────┐
                                          │      TIER 3: BARE-METAL OS    │
                                          │     FlowOS Linux Distribution │
                                          ├───────────────────────────────┤
                                          │ • Linux Kernel LTS (x86_64)   │
                                          │ • Minimal init (BusyBox/Alpine)│
                                          │ • Direct boot to FlowOS shell │
                                          │ • Instant 3-second cold boot  │
                                          └───────────────────────────────┘
```

### Architectural Tiers & Engineering Feasibility

| Level | Target Platform | Core Technologies | System Access | Development Scale | Feasibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Native Shell** | Windows 10/11, Linux (Ubuntu/Arch) | **Tauri v2 (Rust)** or **Electron** + Node.js | Full filesystem, real terminal (`pty`), process spawning, raw audio/video | **2 – 4 Weeks** | **Very High (Recommended Starting Point)** |
| **Tier 2: Wayland Compositor** | Linux Desktop Environment | **Rust + Smithay** or **C + wlroots** + WRY WebView | Host real Linux X11/Wayland GUI apps inside FlowOS window frames | **3 – 5 Months** | **High (Authentic Desktop OS Experience)** |
| **Tier 3: Bare-Metal Distro** | x86_64 / ARM64 Physical Hardware | Linux Kernel + Minimal rootfs + DRM/KMS + Mesa | Complete hardware control (GPU, Wi-Fi, Bluetooth, Audio via ALSA/PipeWire) | **6 – 12 Months** | **Moderate (Requires Distro Maintenance)** |

---

### Tier 1: Native Desktop Shell (Tauri v2 + Rust Bridge)
- **Concept:** Package FlowOS into a lightweight desktop runtime powered by Tauri v2 and the native system webview (WebView2 on Windows, WebKitGTK on Linux).
- **Windows Shell Replacement:**
  - Modify Windows Registry key: `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell = "C:\FlowOS\flowos.exe"`
  - FlowOS boots directly instead of `explorer.exe`, eliminating the Windows taskbar and Start Menu in favor of FlowOS's TopBar and Dock.
- **Real Native Terminal:** Connect `terminal` directly to physical Windows PowerShell / Linux bash via Rust PTY bindings (`portable-pty`).
- **Real File Operations:** Expose the physical drive (`C:\` or `/home/$USER`) through Rust IPC commands, replacing the browser VFS with true disk I/O.
- **Footprint:** ~35 MB binary, ~80 MB RAM idle (Tauri).

### Tier 2: Custom Linux Wayland Desktop Environment
- **Concept:** Similar to ChromeOS or SteamOS GameScope. FlowOS acts as the **Wayland Compositor** and window manager.
- **Compositor Engine:** Use **Smithay** (Rust-based Wayland library) or **wlroots**.
- **Native Application Embedding:**
  - When a user launches a native Linux app (e.g. `code`, `google-chrome`, `steam`), the compositor intercepts the `wl_surface` / `xdg_toplevel` buffers and paints them directly inside FlowOS's DOM window frames using WebGL or shared memory surfaces.
- **Hardware Integration:**
  - Network: D-Bus integration with `NetworkManager` for real Wi-Fi scanning.
  - Bluetooth: BlueZ D-Bus bindings.
  - Audio: Native PipeWire / PulseAudio sliders in Control Center.
  - Brightness/Battery: Read `/sys/class/backlight` and `/sys/class/power_supply`.

### Tier 3: Standalone Bare-Metal Linux Distribution (FlowOS ISO)
- **Concept:** A bootable Linux live ISO and installer (based on Alpine Linux or Arch Linux).
- **Boot Chain:** UEFI (GRUB/systemd-boot) $\to$ Linux Kernel $\to$ Minimal init system $\to$ FlowOS Wayland Compositor (direct KMS/DRM display output).
- **Zero Overhead:** No GNOME, KDE, or legacy X11 packages. Boots directly from BIOS to FlowOS in ~3.2 seconds.
- **Deployment:** Live USB flashable via Rufus or BalenaEtcher.

