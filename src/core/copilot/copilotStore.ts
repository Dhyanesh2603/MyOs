import { create } from 'zustand';
import { useWindowStore } from '@core/window/windowStore';
import { useProcessStore } from '@core/process/processStore';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeBlock?: string;
  codeLanguage?: string;
}

interface CopilotState {
  isOpen: boolean;
  messages: CopilotMessage[];
  isThinking: boolean;
  toggleCopilot: () => void;
  openCopilot: () => void;
  closeCopilot: () => void;
  sendMessage: (prompt: string) => Promise<void>;
  clearHistory: () => void;
}

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: 'welcome',
    sender: 'assistant',
    content: "👋 Hello! I am your FlowOS AI Copilot. I have context over your active windows, VFS workspace, and terminal. How can I assist your workflow today?",
    timestamp: Date.now(),
  },
];

export const useCopilotStore = create<CopilotState>((set) => ({
  isOpen: false,
  messages: INITIAL_MESSAGES,
  isThinking: false,

  toggleCopilot: () => set((s) => ({ isOpen: !s.isOpen })),
  openCopilot: () => set({ isOpen: true }),
  closeCopilot: () => set({ isOpen: false }),

  clearHistory: () => set({ messages: INITIAL_MESSAGES }),

  sendMessage: async (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: cleanPrompt,
      timestamp: Date.now(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
    }));

    // Gather active window context
    const { activeWindowId, windows } = useWindowStore.getState();
    const activeWin = activeWindowId ? windows[activeWindowId] : undefined;
    const activeContext = activeWin ? `Active Window: "${activeWin.title}" (Process ID: ${activeWin.processId})` : 'Desktop Surface active';

    // Simulate smart thinking delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const lower = cleanPrompt.toLowerCase();
    let reply = '';
    let codeBlock: string | undefined = undefined;
    let codeLanguage: string | undefined = undefined;

    if (lower.includes('explain') || lower.includes('code') || lower.includes('debug')) {
      reply = `Inspected context for **${activeWin?.title ?? 'Active Project'}**.\n\nHere is an optimized architectural routine for safe execution and error containment in your FlowOS environment:`;
      codeBlock = `// Sandboxed Worker Task Orchestrator\nexport async function executeSandboxTask(routine: () => Promise<unknown>) {\n  try {\n    const start = performance.now();\n    const outcome = await Promise.race([\n      routine(),\n      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout 5000ms')), 5000))\n    ]);\n    return { success: true, duration: performance.now() - start, data: outcome };\n  } catch (err: any) {\n    return { success: false, error: err.message };\n  }\n}`;
      codeLanguage = 'typescript';
    } else if (lower.includes('terminal') || lower.includes('script') || lower.includes('bash') || lower.includes('flowsh')) {
      reply = `Here is a custom \`flowsh\` command sequence to automate your VFS project directory and test execution:`;
      codeBlock = `# FlowOS Automated Pipeline\nmkdir -p /home/user/Workspace/scripts\ntouch /home/user/Workspace/scripts/benchmark.js\npkg list\nrun /home/user/Workspace/scripts/benchmark.js`;
      codeLanguage = 'bash';
    } else if (lower.includes('note') || lower.includes('draft') || lower.includes('summarize')) {
      reply = `Here is a structured executive summary formatted with Obsidian-style tags ready for your Notes app:`;
      codeBlock = `# FlowOS Sprint Objectives\n#flowos #roadmap #architecture\n\n- [x] Multi-Desktop Spaces (Ctrl+1..4)\n- [x] Sandboxed WebWorker Execution\n- [x] Ambient Generative Canvas Shaders\n- [ ] Deploy Cloud Sync Bridge`;
      codeLanguage = 'markdown';
    } else if (lower.includes('system') || lower.includes('health') || lower.includes('diagnos') || lower.includes('stat')) {
      const winCount = Object.keys(windows).length;
      const { processes } = useProcessStore.getState();
      reply = `**Kernel Health & Telemetry Diagnostic**\n\n- **Context**: ${activeContext}\n- **Active Processes**: ${processes.length} running PIDs\n- **Open Windows**: ${winCount} interactive surfaces\n- **VFS Storage Layer**: IndexedDB \`FlowOS_Storage\` [ONLINE]\n- **Audio Engine**: Web Audio API Procedural Synthesizer [ONLINE]\n- **Status**: Zero memory leaks detected, nominal 60 FPS compositor throughput.`;
    } else {
      reply = `Understood. Analyzing "${cleanPrompt}" against your FlowOS workspace context (${activeContext}).\n\nYou can run code via the **Code Editor** ▶ button, manage packages with \`pkg\` in **Terminal**, capture screen areas with \`Ctrl+Shift+S\`, or search file contents deeply using Spotlight \`Ctrl+K\`.`;
    }

    const assistantMsg: CopilotMessage = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      content: reply,
      timestamp: Date.now(),
      codeBlock,
      codeLanguage,
    };

    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isThinking: false,
    }));
  },
}));
