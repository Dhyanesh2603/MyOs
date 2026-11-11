import { vfs, normalizePath } from '@core/vfs/vfsService';
import { useProcessStore } from '@core/process/processStore';
import { executeCode } from '@core/runtime/codeRunner';
import { usePackageStore } from '@core/packages/packageStore';
import { useDeviceStorageStore } from '@core/vfs/deviceStorage';

export interface ShellResult {
  output: string;
  newCwd?: string;
}

// ─── Environment Variables Store ──────────────────────────────────────────────
const envVars: Record<string, string> = {
  USER: 'user',
  HOME: '/home/user',
  SHELL: '/bin/onyxsh',
  PATH: '/bin:/usr/bin:/usr/local/bin',
  TERM: 'xterm-256color',
  OS: 'Onyx OS',
  ARCH: 'x86_64-synthetic-wasm',
  LANG: 'en_US.UTF-8',
  EDITOR: 'code-editor',
};

// Aliases Store
const aliases: Record<string, string> = {
  ll: 'ls -la',
  la: 'ls -a',
  cls: 'clear',
  py: 'python',
  node: 'run',
};

let oldPwd = '/home/user';

// Mock Git State
const gitState = {
  branch: 'main',
  staged: new Set<string>(),
  commits: [
    { hash: 'a1b2c3d', msg: 'feat: authentic iOS squircle icon system and refined dock ergonomics', date: 'Just now' },
    { hash: 'f4e5d6c', msg: 'fix: native iframe embed for Google Search with igu=1 parameter', date: '10 mins ago' },
    { hash: '937c10a', msg: 'feat: curated glassmorphic desktop app grid with right-click toggle', date: '1 hour ago' },
    { hash: 'ae2ad1b', msg: 'docs: update architecture roadmap and empty-state onboarding v3', date: 'Yesterday' },
    { hash: '7f5121a', msg: 'feat: Warp terminal Unix shell with pipeline engine and tab completion', date: '2 days ago' },
  ],
};

// ─── Tokenize command input respecting quotes and variables ───────────────────
export function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;

    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (ch === '\\' && !inSingleQuote) {
      escapeNext = true;
      continue;
    }

    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (ch === '$' && !inSingleQuote) {
      // Extract environment variable
      let varName = '';
      let j = i + 1;
      while (j < input.length && /[a-zA-Z0-9_]/.test(input[j]!)) {
        varName += input[j]!;
        j++;
      }
      if (varName) {
        current += envVars[varName] ?? '';
        i = j - 1;
        continue;
      }
    }

    if (/\s/.test(ch) && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

// ─── Pipe-aware command splitter ─────────────────────────────────────────────
function splitPipeline(input: string): string[] {
  const segments: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === '|' && !inSingle && !inDouble) {
      segments.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  segments.push(current.trim());
  return segments.filter(Boolean);
}

// ─── Apply a filter stage to piped text ──────────────────────────────────────
function applyFilter(text: string, segment: string): string {
  const parts = tokenizeCommand(segment);
  const cmd = parts[0]?.toLowerCase() ?? '';

  if (cmd === 'grep') {
    const pattern = parts[1] ?? '';
    if (!pattern) return text;
    try {
      const re = new RegExp(pattern, 'gi');
      const matched = text.split('\n').filter((l) => re.test(l));
      return matched.length ? matched.join('\n') : '(no matches)';
    } catch {
      return (
        text
          .split('\n')
          .filter((l) => l.toLowerCase().includes(pattern.toLowerCase()))
          .join('\n') || '(no matches)'
      );
    }
  }

  if (cmd === 'wc') {
    const flag = parts[1] ?? '-l';
    const lines = text.split('\n');
    if (flag === '-l') return `${lines.length} lines`;
    if (flag === '-w') return `${text.split(/\s+/).filter(Boolean).length} words`;
    if (flag === '-c') return `${text.length} chars`;
    return `${lines.length} lines  ${text.split(/\s+/).filter(Boolean).length} words  ${text.length} chars`;
  }

  if (cmd === 'head') {
    const n = parseInt(parts[1] ?? '10', 10);
    return text
      .split('\n')
      .slice(0, isNaN(n) ? 10 : n)
      .join('\n');
  }

  if (cmd === 'tail') {
    const n = parseInt(parts[1] ?? '10', 10);
    const lines = text.split('\n');
    return lines.slice(Math.max(0, lines.length - (isNaN(n) ? 10 : n))).join('\n');
  }

  if (cmd === 'sort') {
    const lines = text.split('\n');
    lines.sort();
    return lines.join('\n');
  }

  if (cmd === 'uniq') {
    const lines = text.split('\n');
    return lines.filter((l, i) => l !== lines[i - 1]).join('\n');
  }

  if (cmd === 'tr') {
    const from = parts[1] ?? '';
    const to = parts[2] ?? '';
    if (from && to) {
      let out = text;
      for (let i = 0; i < from.length; i++) {
        const char = from[i];
        if (!char) continue;
        out = out.split(char).join(to[i] ?? '');
      }
      return out;
    }
    return text;
  }

  return text;
}

// ─── Tree visualizer (recursive, max depth 5) ────────────────────────────────
async function renderTree(path: string, prefix = '', depth = 0): Promise<string> {
  if (depth > 5) return `${prefix}... (max depth reached)`;
  const lines: string[] = [];
  try {
    const nodes = await vfs.readDir(path);
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      const isLast = i === nodes.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? prefix + '    ' : prefix + '│   ';
      const label = node.type === 'directory' ? `${node.name}/` : node.name;
      lines.push(`${prefix}${connector}${label}`);
      if (node.type === 'directory') {
        const sub = await renderTree(`${path}/${node.name}`, childPrefix, depth + 1);
        if (sub) lines.push(sub);
      }
    }
  } catch {
    lines.push(`${prefix}(unreadable)`);
  }
  return lines.join('\n');
}

// ─── Recursive file finder ───────────────────────────────────────────────────
async function findFiles(startPath: string, nameFilter?: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const nodes = await vfs.readDir(startPath);
    for (const node of nodes) {
      if (!nameFilter || node.name.toLowerCase().includes(nameFilter.toLowerCase())) {
        results.push(node.path);
      }
      if (node.type === 'directory') {
        const sub = await findFiles(node.path, nameFilter);
        results.push(...sub);
      }
    }
  } catch {
    // Ignore unreadable
  }
  return results;
}

// ─── Main command executor ────────────────────────────────────────────────────
export async function executeCommand(
  input: string,
  cwd: string,
  sessionHistory: string[] = []
): Promise<ShellResult> {
  let trimmed = input.trim();
  if (!trimmed) return { output: '' };

  // Check alias replacement
  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() ?? '';
  if (aliases[firstWord]) {
    trimmed = trimmed.replace(firstWord, aliases[firstWord]!);
  }

  // ── Redirection Check (> or >>) ──────────────────────────────────────────
  if (trimmed.includes('>>')) {
    const [cmdPart, destPart] = trimmed.split('>>');
    if (cmdPart && destPart) {
      const dest = destPart.trim();
      const res = await executeCommand(cmdPart.trim(), cwd, sessionHistory);
      const destPath = dest.startsWith('/') ? dest : normalizePath(`${cwd}/${dest}`);
      let existing = '';
      try {
        existing = await vfs.readFile(destPath);
      } catch {
        // file doesn't exist yet
      }
      await vfs.writeFile(destPath, existing ? `${existing}\n${res.output}` : res.output);
      return { output: '', newCwd: res.newCwd };
    }
  } else if (trimmed.includes('>')) {
    const [cmdPart, destPart] = trimmed.split('>');
    if (cmdPart && destPart) {
      const dest = destPart.trim();
      const res = await executeCommand(cmdPart.trim(), cwd, sessionHistory);
      const destPath = dest.startsWith('/') ? dest : normalizePath(`${cwd}/${dest}`);
      await vfs.writeFile(destPath, res.output);
      return { output: '', newCwd: res.newCwd };
    }
  }

  // ── Pipeline detection ────────────────────────────────────────────────────
  const segments = splitPipeline(trimmed);
  if (segments.length > 1) {
    const firstSegment = segments[0] ?? '';
    const firstResult = await executeCommand(firstSegment, cwd, sessionHistory);
    let piped = firstResult.output;
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      if (seg) {
        piped = applyFilter(piped, seg);
      }
    }
    return { output: piped, newCwd: firstResult.newCwd };
  }

  // ── Tokenize command arguments ───────────────────────────────────────────
  const tokens = tokenizeCommand(trimmed);
  const command = tokens[0]?.toLowerCase() ?? '';
  const args = tokens.slice(1);

  switch (command) {
    case 'help':
      return {
        output: [
          'Onyx OS Shell (onyxsh) v2.0.0 — POSIX & Developer Suite',
          '────────────────────────────────────────────────────────',
          'File System & Navigation:',
          '  pwd                     Print current working directory',
          '  ls [-l|-a|-la] [path]   List directory files (detailed permissions & size)',
          '  cd [path]               Change directory (supports ~, .., -, /)',
          '  cat [-n] <file>         Print file contents with optional line numbers',
          '  cp <src> <dst>          Copy file',
          '  mv <src> <dst>          Move or rename file',
          '  rm [-r|-rf] <path>      Delete file or directory recursively',
          '  touch <file>            Create an empty file',
          '  mkdir [-p] <dir>        Create directory',
          '  tree [path]             Visual directory tree diagram',
          '  find [path] [query]     Search files by name',
          '',
          'Development & Runtime:',
          '  git <cmd> [args]        Git VCS (status, log, branch, add, commit, diff)',
          '  python [-c|file]        Python 3.12 runner & math evaluator',
          '  node [-e|file]          Node.js JS runtime & script executor',
          '  npm [list|install|run]  Package manager commands',
          '  eval <javascript>       Direct V8 JavaScript evaluation',
          '  run <script.js>         Execute file with runtime console logs',
          '  neofetch / fastfetch    Display Onyx OS system information & ASCII art',
          '',
          'Applications & GUI Integration:',
          '  open <path|url|-a app>  Open files, directories, apps, or websites',
          '  code <file>             Open file directly in Code Editor',
          '  nano / vim <file>       Open file in text editor',
          '',
          'Device & Storage:',
          '  device [list|mount]     Mount host PC hard drive via W3C File System API',
          '  mount / df / free       Inspect virtual and mounted file systems & RAM',
          '',
          'Utilities & Pipeline:',
          '  echo <text>             Print text (supports > and >> redirection)',
          '  grep <pat> [file]       Search lines matching pattern or regex',
          '  wc [-l|-w|-c] [file]    Count lines, words, or bytes',
          '  head / tail [n] [file]  View top or bottom lines of a file',
          '  sort / uniq / tr        Text sorting, deduplication, and transformation',
          '  curl <url>              Fetch text from web or public APIs',
          '  ping <host>             Simulated ICMP ping with round-trip latency',
          '  calc <expression>       Evaluate math formulas (calc 2^10 + sqrt(144))',
          '  history                 Display command history',
          '  man <command>           View manual page documentation',
          '  clear / cls             Clear terminal screen',
        ].join('\n'),
      };

    case 'pwd':
      return { output: cwd };

    case 'whoami':
      return { output: envVars['USER'] || 'user' };

    case 'hostname':
      return { output: 'onyx-desktop' };

    case 'uname': {
      if (args[0] === '-a' || args[0] === '-all') {
        return {
          output: `OnyxOS onyx-desktop 6.10.0-onyx #1 SMP PREEMPT 2026 x86_64 synthetic-wasm GNU/Linux`,
        };
      }
      return { output: 'Onyx OS' };
    }

    case 'date':
      return { output: new Date().toString() };

    case 'uptime': {
      const ms = performance.now();
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      return { output: `up ${mins} min(s), ${secs} sec(s), 1 user, load average: 0.08, 0.05, 0.01` };
    }

    case 'env':
    case 'printenv':
      return {
        output: Object.entries(envVars)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n'),
      };

    case 'export': {
      const expr = args[0];
      if (!expr || !expr.includes('=')) {
        return { output: 'export: usage: export KEY=VALUE' };
      }
      const [key, val] = expr.split('=');
      if (key && val !== undefined) {
        envVars[key.trim()] = val.trim();
        return { output: '' };
      }
      return { output: 'export: invalid syntax' };
    }

    case 'unset': {
      const key = args[0];
      if (key && envVars[key]) {
        delete envVars[key];
        return { output: '' };
      }
      return { output: '' };
    }

    case 'which': {
      const target = args[0];
      if (!target) return { output: 'which: missing command operand' };
      return { output: `/bin/${target}` };
    }

    case 'history': {
      if (sessionHistory.length === 0) return { output: 'No history recorded yet.' };
      return {
        output: sessionHistory.map((cmd, idx) => `  ${String(idx + 1).padStart(3, ' ')}  ${cmd}`).join('\n'),
      };
    }

    // ── Neofetch System Information Banner ──────────────────────────────────
    case 'neofetch':
    case 'fastfetch': {
      const ms = performance.now();
      const mins = Math.max(1, Math.floor(ms / 60000));
      return {
        output: [
          '        /\\          user@onyx-desktop',
          '       /  \\         -------------------',
          '      / /\\ \\        OS: Onyx OS 2.0 (Charcoal Edition)',
          '     / /  \\ \\       Kernel: 6.10.0-onyx (synthetic-wasm)',
          `    / /    \\ \\      Uptime: ${mins} min(s)`,
          '   / /______\\ \\     Shell: onyxsh 2.0.0 (zsh-mode)',
          '  / /________\\ \\    Resolution: 1920x1080 (Retina Display)',
          ' /_/          \\_\\   Theme: Pitch Charcoal / Onyx Dark',
          '                    Icons: Monochrome Minimalist Dot Matrix',
          '                    CPU: Synthetic Virtual Core (8) @ 3.4 GHz',
          '                    Memory: 840 MiB / 4096 MiB (20%)',
          '                    Disk: 1.4 GiB / 10.0 GiB (IndexedDB POSIX)',
          '',
          '                    \u001b[30m███\u001b[31m███\u001b[32m███\u001b[33m███\u001b[34m███\u001b[35m███\u001b[36m███\u001b[37m███\u001b[0m',
        ].join('\n'),
      };
    }

    // ── Git Version Control System ───────────────────────────────────────────
    case 'git': {
      const sub = args[0]?.toLowerCase();
      if (!sub || sub === '--help') {
        return {
          output: [
            'usage: git [--version] [--help] <command> [<args>]',
            '',
            'These are common Git commands used in various situations:',
            '   status     Show the working tree status',
            '   branch     List, create, or delete branches',
            '   log        Show commit logs',
            '   diff       Show changes between commits, commit and working tree, etc',
            '   add        Add file contents to the index',
            '   commit     Record changes to the repository',
          ].join('\n'),
        };
      }

      if (sub === '--version' || sub === 'version') {
        return { output: 'git version 2.45.2 (Onyx OS Edition)' };
      }

      if (sub === 'status') {
        const stagedList = Array.from(gitState.staged);
        const stagedText = stagedList.length > 0
          ? `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n${stagedList.map((f) => `\tnew file:   ${f}`).join('\n')}\n\n`
          : '';
        return {
          output: [
            `On branch ${gitState.branch}`,
            'Your branch is up to date with \'origin/main\'.',
            '',
            stagedText,
            stagedList.length === 0 ? 'nothing to commit, working tree clean' : '',
          ].join('\n').trim(),
        };
      }

      if (sub === 'branch') {
        return {
          output: `* ${gitState.branch}\n  dev\n  release/v2.4`,
        };
      }

      if (sub === 'log') {
        return {
          output: gitState.commits
            .map(
              (c) =>
                `commit ${c.hash}7a98b2c4e1f8d3a7\nAuthor: Onyx OS User <user@onyxos.dev>\nDate:   ${c.date}\n\n    ${c.msg}\n`
            )
            .join('\n'),
        };
      }

      if (sub === 'add') {
        const file = args[1];
        if (!file) return { output: 'Nothing specified, nothing added.' };
        gitState.staged.add(file);
        return { output: '' };
      }

      if (sub === 'commit') {
        let msg = 'chore: update files';
        const mIdx = args.indexOf('-m');
        if (mIdx !== -1 && args[mIdx + 1]) {
          msg = args[mIdx + 1]!;
        }
        const hash = Math.random().toString(36).slice(2, 9);
        gitState.commits.unshift({ hash, msg, date: 'Just now' });
        const count = gitState.staged.size || 1;
        gitState.staged.clear();
        return { output: `[${gitState.branch} ${hash}] ${msg}\n ${count} file(s) changed` };
      }

      if (sub === 'diff') {
        return { output: 'diff --git a/onyx.config.ts b/onyx.config.ts\n--- a/onyx.config.ts\n+++ b/onyx.config.ts\n@@ -1,3 +1,4 @@\n+export const IOS_ICONS_ENABLED = true;\n+export const IFRAME_DIRECT_EMBED = true;' };
      }

      return { output: `git: '${sub}' is not a git command. See 'git --help'.` };
    }

    // ── Python Runtime Simulator ─────────────────────────────────────────────
    case 'python':
    case 'python3':
    case 'py': {
      if (args[0] === '--version' || args[0] === '-v') {
        return { output: 'Python 3.12.4 (Onyx OS Emulated Subsystem, Jul 2026)' };
      }

      if (args[0] === '-c') {
        const expr = args.slice(1).join(' ');
        if (!expr) return { output: 'python: missing code expression' };
        try {
          // If expression looks like print(...), extract inside
          const printMatch = expr.match(/^print\((.*)\)$/);
          const toEval = printMatch && printMatch[1] ? printMatch[1] : expr;
          const sanitized = toEval.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
          // eslint-disable-next-line no-eval
          const res = Function(`"use strict"; return (${sanitized})`)();
          return { output: String(res) };
        } catch (err: unknown) {
          return { output: `Traceback (most recent call last):\n  File "<string>", line 1\nSyntaxError: ${String(err)}` };
        }
      }

      if (args.length > 0) {
        const file = args[0]!;
        const filePath = file.startsWith('/') ? file : normalizePath(`${cwd}/${file}`);
        try {
          const content = await vfs.readFile(filePath);
          void content;
          return { output: `[Python 3.12.4 Executed: ${file}]\nFile executed successfully.` };
        } catch {
          return { output: `python: can't open file '${file}': [Errno 2] No such file or directory` };
        }
      }

      return {
        output: [
          'Python 3.12.4 (tags/v3.12.4:d141571, Onyx OS Core)',
          '[Clang 16.0.0 (synthetic-wasm)] on onyxos',
          'Type "help", "copyright", "credits" or "license" for more information.',
          '>>> (Run with -c "code" or "python script.py" for batch execution)',
        ].join('\n'),
      };
    }

    // ── Node & NPM Developer Commands ─────────────────────────────────────────
    case 'npm': {
      const sub = args[0]?.toLowerCase();
      if (!sub || sub === '--version' || sub === '-v') {
        return { output: '10.8.2' };
      }

      if (sub === 'list' || sub === 'ls') {
        return {
          output: [
            'onyx-os@2.0.0 /home/user',
            '├── react@19.0.0',
            '├── typescript@5.7.3',
            '├── tailwindcss@3.4.17',
            '├── zustand@5.0.3',
            '├── framer-motion@12.4.7',
            '└── lucide-react@1.16.0',
          ].join('\n'),
        };
      }

      if (sub === 'run') {
        const script = args[1] || 'dev';
        return {
          output: `> onyx-os@2.0.0 ${script}\n> vite\n\n  VITE v6.4.3  ready in 420 ms\n  ➜  Local:   http://localhost:3000/`,
        };
      }

      if (sub === 'install' || sub === 'i') {
        const pkg = args[1] || 'all dependencies'; void pkg;
        return {
          output: `added 1 package, and audited 184 packages in 840ms\nfound 0 vulnerabilities`,
        };
      }

      return { output: `npm ${sub}: command completed.` };
    }

    // ── Directory Navigation: cd ─────────────────────────────────────────────
    case 'cd': {
      const target = args[0];
      const prev = cwd;

      if (!target || target === '~') {
        oldPwd = prev;
        return { output: '', newCwd: '/home/user' };
      }

      if (target === '-') {
        const next = oldPwd;
        oldPwd = prev;
        return { output: next, newCwd: next };
      }

      if (target === '..') {
        const parts = cwd.split('/').filter(Boolean);
        parts.pop();
        const next = '/' + parts.join('/');
        oldPwd = prev;
        return { output: '', newCwd: next === '/' ? '/' : next };
      }

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      const stat = await vfs.stat(targetPath);
      if (!stat) {
        return { output: `cd: no such file or directory: ${target}` };
      }
      if (stat.type !== 'directory') {
        return { output: `cd: not a directory: ${target}` };
      }

      oldPwd = prev;
      return { output: '', newCwd: targetPath };
    }

    // ── List Directory: ls ───────────────────────────────────────────────────
    case 'ls': {
      let targetArg: string | undefined;
      let showDetails = false;
      let showAll = false;

      for (const a of args) {
        if (a.startsWith('-')) {
          if (a.includes('l')) showDetails = true;
          if (a.includes('a')) showAll = true;
        } else {
          targetArg = a;
        }
      }

      const targetPath = targetArg
        ? targetArg.startsWith('/')
          ? targetArg
          : normalizePath(`${cwd}/${targetArg}`)
        : cwd;

      try {
        const nodes = await vfs.readDir(targetPath);
        let list = nodes;
        if (!showAll) {
          list = list.filter((n) => !n.name.startsWith('.'));
        }

        if (list.length === 0) return { output: '(empty directory)' };

        if (showDetails) {
          const header = `total ${list.length}`;
          const rows = list.map((n) => {
            const perms = n.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
            const size = String(n.size).padStart(6, ' ');
            const date = new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
            return `${perms}  1 user staff ${size} ${date} ${n.name}${n.type === 'directory' ? '/' : ''}`;
          });
          return { output: [header, ...rows].join('\n') };
        }

        const lines = list.map((n) => {
          const typeIndicator = n.type === 'directory' ? '/' : '';
          return `${n.name}${typeIndicator}`;
        });

        return { output: lines.join('   ') };
      } catch {
        return { output: `ls: cannot access '${targetPath}': No such directory` };
      }
    }

    // ── Cat with optional line numbers ────────────────────────────────────────
    case 'cat': {
      let showNumbers = false;
      let target: string | undefined;

      for (const a of args) {
        if (a === '-n') showNumbers = true;
        else target = a;
      }

      if (!target) return { output: 'cat: missing file operand' };

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      try {
        const content = await vfs.readFile(targetPath);
        if (showNumbers) {
          return {
            output: content
              .split('\n')
              .map((line, idx) => `  ${String(idx + 1).padStart(4, ' ')}  ${line}`)
              .join('\n'),
          };
        }
        return { output: content };
      } catch {
        return { output: `cat: ${target}: No such file or directory` };
      }
    }

    // ── Open (files, dirs, URLs, or apps) ────────────────────────────────────
    case 'open': {
      if (args.length === 0) return { output: 'open: missing file, folder, or application' };

      if (args[0] === '-a') {
        const appName = args[1];
        if (!appName) return { output: 'open -a: missing application name' };
        useProcessStore.getState().launchApp(appName);
        return { output: `Launched ${appName}` };
      }

      const target = args[0]!;

      // Web URL
      if (target.startsWith('http://') || target.startsWith('https://')) {
        useProcessStore.getState().launchApp('browser');
        return { output: `Opening ${target} in Browser...` };
      }

      // Current directory
      if (target === '.' || target === './') {
        useProcessStore.getState().launchApp('file-explorer', { initialPath: cwd });
        return { output: `Opening ${cwd} in Files...` };
      }

      const targetPath = target.startsWith('/') ? target : normalizePath(`${cwd}/${target}`);
      const ext = target.split('.').pop()?.toLowerCase();

      if (ext === 'html' || ext === 'htm') {
        useProcessStore.getState().launchApp('browser');
        return { output: `Opening ${targetPath} in Browser...` };
      }
      if (ext === 'md' || ext === 'txt') {
        useProcessStore.getState().launchApp('notes');
        return { output: `Opening ${targetPath} in Notes...` };
      }

      useProcessStore.getState().launchApp('code-editor');
      return { output: `Opening ${targetPath} in Code Editor...` };
    }

    // ── Text Editors: code, nano, vim, vi ────────────────────────────────────
    case 'code':
    case 'vim':
    case 'vi': {
      const file = args[0];
      useProcessStore.getState().launchApp('code-editor');
      return { output: file ? `Opening ${file} in Code Editor...` : 'Launching Code Editor...' };
    }

    case 'nano': {
      const file = args[0];
      useProcessStore.getState().launchApp('notes');
      return { output: file ? `Opening ${file} in Notes...` : 'Launching Notes Editor...' };
    }

    // ── Manual Pages ─────────────────────────────────────────────────────────
    case 'man': {
      const query = args[0]?.toLowerCase();
      if (!query) return { output: 'What manual page do you want? (e.g. man ls, man git, man python)' };

      const manualPages: Record<string, string> = {
        ls: 'LS(1) — List directory contents\n\nSYNOPSIS\n    ls [-l] [-a] [path]\n\nDESCRIPTION\n    List information about files in the target directory (the current directory by default).',
        cd: 'CD(1) — Change directory\n\nSYNOPSIS\n    cd [directory]\n\nDESCRIPTION\n    Change the current working directory to directory. Supports ~, .., -, and full paths.',
        cat: 'CAT(1) — Concatenate and print files\n\nSYNOPSIS\n    cat [-n] [file ...]\n\nDESCRIPTION\n    The cat utility reads files sequentially, writing them to standard output.',
        git: 'GIT(1) — Fast version control system\n\nSYNOPSIS\n    git [status | branch | log | add | commit | diff]\n\nDESCRIPTION\n    Manage branch commits and project history inside Onyx OS.',
        python: 'PYTHON(1) — Python programming language interpreter\n\nSYNOPSIS\n    python [-c "code"] [script.py]\n\nDESCRIPTION\n    Execute Python mathematical expressions, algorithms, and scripts.',
        curl: 'CURL(1) — Transfer data from or to a server\n\nSYNOPSIS\n    curl [url]\n\nDESCRIPTION\n    Fetch text, documents, or JSON APIs from external web destinations.',
      };

      return { output: manualPages[query] ?? `No manual entry for ${query}.` };
    }

    case 'cp': {
      const src = args[0];
      const dst = args[1];
      if (!src || !dst) return { output: 'cp: missing destination file operand after source' };

      const srcPath = src.startsWith('/') ? src : normalizePath(`${cwd}/${src}`);
      const dstPath = dst.startsWith('/') ? dst : normalizePath(`${cwd}/${dst}`);

      try {
        const content = await vfs.readFile(srcPath);
        await vfs.writeFile(dstPath, content);
        return { output: '' };
      } catch (err: unknown) {
        return { output: `cp: cannot copy '${src}': ${(err as Error).message}` };
      }
    }

    case 'mv': {
      const src = args[0];
      const dst = args[1];
      if (!src || !dst) return { output: 'mv: missing destination file operand after source' };

      const srcPath = src.startsWith('/') ? src : normalizePath(`${cwd}/${src}`);
      const dstPath = dst.startsWith('/') ? dst : normalizePath(`${cwd}/${dst}`);

      try {
        const content = await vfs.readFile(srcPath);
        await vfs.writeFile(dstPath, content);
        await vfs.deleteNode(srcPath);
        return { output: '' };
      } catch (err: unknown) {
        return { output: `mv: cannot move '${src}': ${(err as Error).message}` };
      }
    }

    case 'grep': {
      const pattern = args[0];
      const targetFile = args[1];
      if (!pattern) return { output: 'grep: missing pattern' };
      if (!targetFile) return { output: 'grep: no input. Usage: grep <pattern> <file> or cat <file> | grep <pattern>' };

      const targetPath = targetFile.startsWith('/') ? targetFile : normalizePath(`${cwd}/${targetFile}`);
      try {
        const content = await vfs.readFile(targetPath);
        return { output: applyFilter(content, `grep ${pattern}`) };
      } catch {
        return { output: `grep: ${targetFile}: No such file or directory` };
      }
    }

    case 'wc': {
      const targetFile = args.find((a) => !a.startsWith('-'));
      const flag = args.find((a) => a.startsWith('-')) || '-l';
      if (!targetFile) return { output: 'wc: no input. Usage: wc [-l|-w|-c] <file> or cat <file> | wc' };

      const targetPath = targetFile.startsWith('/') ? targetFile : normalizePath(`${cwd}/${targetFile}`);
      try {
        const content = await vfs.readFile(targetPath);
        return { output: applyFilter(content, `wc ${flag}`) };
      } catch {
        return { output: `wc: ${targetFile}: No such file or directory` };
      }
    }

    case 'head': {
      const n = args.find((a) => /^\d+$/.test(a)) || '10';
      const targetFile = args.find((a) => !/^\d+$/.test(a));
      if (!targetFile) return { output: 'head: missing file operand' };

      const targetPath = targetFile.startsWith('/') ? targetFile : normalizePath(`${cwd}/${targetFile}`);
      try {
        const content = await vfs.readFile(targetPath);
        return { output: applyFilter(content, `head ${n}`) };
      } catch {
        return { output: `head: ${targetFile}: No such file or directory` };
      }
    }

    case 'tail': {
      const n = args.find((a) => /^\d+$/.test(a)) || '10';
      const targetFile = args.find((a) => !/^\d+$/.test(a));
      if (!targetFile) return { output: 'tail: missing file operand' };

      const targetPath = targetFile.startsWith('/') ? targetFile : normalizePath(`${cwd}/${targetFile}`);
      try {
        const content = await vfs.readFile(targetPath);
        return { output: applyFilter(content, `tail ${n}`) };
      } catch {
        return { output: `tail: ${targetFile}: No such file or directory` };
      }
    }

    case 'sort': {
      const targetFile = args[0];
      if (!targetFile) return { output: 'sort: missing file operand' };
      const targetPath = targetFile.startsWith('/') ? targetFile : normalizePath(`${cwd}/${targetFile}`);
      try {
        const content = await vfs.readFile(targetPath);
        return { output: applyFilter(content, 'sort') };
      } catch {
        return { output: `sort: ${targetFile}: No such file or directory` };
      }
    }

    case 'uniq': {
      const targetFile = args[0];
      if (!targetFile) return { output: 'uniq: missing file operand' };
      const targetPath = targetFile.startsWith('/') ? targetFile : normalizePath(`${cwd}/${targetFile}`);
      try {
        const content = await vfs.readFile(targetPath);
        return { output: applyFilter(content, 'uniq') };
      } catch {
        return { output: `uniq: ${targetFile}: No such file or directory` };
      }
    }

    case 'touch': {
      const target = args[0];
      if (!target) return { output: 'touch: missing file operand' };

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      await vfs.writeFile(targetPath, '');
      return { output: '' };
    }

    case 'mkdir': {
      const isRecursive = args.includes('-p');
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return { output: 'mkdir: missing operand' };

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      if (isRecursive) {
        const parts = targetPath.split('/').filter(Boolean);
        let curr = '';
        for (const p of parts) {
          curr += '/' + p;
          try {
            await vfs.mkdir(curr);
          } catch {
            // ignore if exists
          }
        }
      } else {
        await vfs.mkdir(targetPath);
      }
      return { output: '' };
    }

    case 'rm': {
      const target = args.find((a) => !a.startsWith('-'));
      if (!target) return { output: 'rm: missing operand' };

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      try {
        await vfs.deleteNode(targetPath);
        return { output: '' };
      } catch (err) {
        return { output: `rm: cannot remove '${target}': ${(err as Error).message}` };
      }
    }

    case 'echo':
      return { output: args.join(' ') };

    case 'eval': {
      if (args.length === 0) return { output: 'eval: missing JavaScript expression' };
      const code = args.join(' ');
      const result = await executeCode(code);
      const out: string[] = [];
      result.logs.forEach((l) => out.push(`[${l.level}] ${l.message}`));
      if (result.returnValue !== undefined && result.returnValue !== 'undefined') {
        out.push(`=> ${result.returnValue}`);
      }
      if (result.error) out.push(`Error: ${result.error}`);
      out.push(`(completed in ${result.durationMs}ms)`);
      return { output: out.join('\n') };
    }

    case 'run': {
      const target = args[0];
      if (!target) return { output: 'run: missing script file operand' };
      const targetPath = target.startsWith('/') ? target : normalizePath(`${cwd}/${target}`);
      try {
        const fileContent = await vfs.readFile(targetPath);
        const result = await executeCode(fileContent);
        const out: string[] = [];
        result.logs.forEach((l) => out.push(l.message));
        if (result.returnValue !== undefined && result.returnValue !== 'undefined') {
          out.push(`=> ${result.returnValue}`);
        }
        if (result.error) out.push(`Runtime Error:\n${result.error}`);
        return { output: out.join('\n') };
      } catch (err: unknown) {
        return {
          output: `run: cannot read script '${targetPath}': ${(err as Error).message || 'No such file'}`,
        };
      }
    }

    case 'ps': {
      const procs = useProcessStore.getState().getRunningProcesses();
      const header = 'PID                APP              STATE     UPTIME';
      const lines = procs.map((p) => {
        const uptime = Math.round((Date.now() - p.startedAt) / 1000) + 's';
        return `${p.id.padEnd(18)} ${p.appId.padEnd(16)} ${p.state.padEnd(9)} ${uptime}`;
      });
      return { output: [header, ...lines].join('\n') };
    }

    case 'kill': {
      const targetPid = args[0];
      if (!targetPid) return { output: 'kill: missing process ID' };

      const proc = useProcessStore.getState().getProcess(targetPid);
      if (!proc) {
        return { output: `kill: (${targetPid}) - No such process` };
      }

      useProcessStore.getState().terminateProcess(targetPid);
      return { output: `Process ${targetPid} terminated.` };
    }

    case 'ping': {
      const host = args[0] || '8.8.8.8';
      const lines = [
        `PING ${host} (${host}): 56 data bytes`,
        `64 bytes from ${host}: icmp_seq=0 ttl=117 time=14.2 ms`,
        `64 bytes from ${host}: icmp_seq=1 ttl=117 time=15.8 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=117 time=13.9 ms`,
        `64 bytes from ${host}: icmp_seq=3 ttl=117 time=15.1 ms`,
        '',
        `--- ${host} ping statistics ---`,
        `4 packets transmitted, 4 packets received, 0.0% packet loss`,
        `round-trip min/avg/max = 13.9/14.7/15.8 ms`,
      ];
      return { output: lines.join('\n') };
    }

    case 'curl': {
      const url = args[0];
      if (!url) return { output: 'curl: try \'curl --help\' for more information\ncurl: missing URL' };
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      try {
        const resp = await fetch(`https://r.jina.ai/${targetUrl}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const text = await resp.text();
        return { output: text.slice(0, 3000) + (text.length > 3000 ? '\n... (output truncated)' : '') };
      } catch (err: unknown) {
        return { output: `curl: (6) Could not resolve host: ${targetUrl}` };
      }
    }

    case 'calc':
    case 'bc': {
      if (args.length === 0) return { output: 'calc: missing mathematical expression' };
      try {
        const expr = args.join(' ');
        const sanitized = expr.replace(/[^0-9+\-*/().%^eE ]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${sanitized})`)();
        return { output: `${expr} = ${result}` };
      } catch {
        return { output: 'calc: syntax error in expression' };
      }
    }

    case 'tree': {
      const targetPath = args[0]
        ? args[0].startsWith('/')
          ? args[0]
          : normalizePath(`${cwd}/${args[0]}`)
        : cwd;

      const header = targetPath.replace('/home/user', '~');
      const body = await renderTree(targetPath);
      return { output: body ? `${header}\n${body}` : `${header}\n(empty)` };
    }

    case 'find': {
      const startPath = args[0]?.startsWith('/') ? args[0] : cwd;
      const query = args[1] === '-name' ? args[2] : args[1];
      const matches = await findFiles(startPath, query);
      if (matches.length === 0) return { output: '(no matching files)' };
      return { output: matches.join('\n') };
    }

    case 'device': {
      const sub = args[0]?.toLowerCase();
      const devStore = useDeviceStorageStore.getState();

      if (!sub || sub === 'list') {
        if (devStore.mountedFolders.length === 0) {
          return {
            output:
              'No host device directories currently mounted.\nRun "device mount" to mount a folder from your physical computer.',
          };
        }
        const lines = devStore.mountedFolders.map(
          (f) => `${f.vfsPath.padEnd(24)} (${f.fileCount} files, ${(f.totalSize / 1024).toFixed(1)} KB)`
        );
        return { output: ['MOUNTED HOST DIRECTORY      METRICS', ...lines].join('\n') };
      }

      if (sub === 'mount') {
        try {
          const res = await devStore.mountDirectoryPicker();
          return {
            output: res
              ? `Mounted host directory successfully at ${res}`
              : 'Directory picker dismissed or completed.',
          };
        } catch (err: unknown) {
          return { output: `device: error mounting directory: ${String(err)}` };
        }
      }

      if (sub === 'unmount') {
        const target = args[1];
        if (!target) return { output: 'device unmount: missing directory name or path' };
        const vfsPath = target.startsWith('/device/') ? target : `/device/${target}`;
        await devStore.unmountFolder(vfsPath);
        return { output: `Unmounted host folder ${vfsPath}` };
      }

      return { output: 'Usage: device [list | mount | unmount <name>]' };
    }

    case 'mount': {
      const devStore = useDeviceStorageStore.getState();
      const header = 'FILESYSTEM            TYPE            MOUNTPOINT';
      const rows = [
        'idb://onyx_vfs      IndexedDB       /',
        'procfs                Virtual         /proc',
        ...devStore.mountedFolders.map((f) => `host://local-fs       FileSysAccess   ${f.vfsPath}`),
      ];
      return { output: [header, ...rows].join('\n') };
    }

    case 'df': {
      return {
        output: [
          'Filesystem       1K-blocks      Used Available Use% Mounted on',
          'idb://onyx_vfs  10485760    142850  10342910   2% /',
          'host://device     52428800   1842000  50586800   4% /device',
        ].join('\n'),
      };
    }

    case 'free': {
      return {
        output: [
          '               total        used        free      shared  buff/cache   available',
          'Mem:         4194304      838860     3355444           0           0     3355444',
          'Swap:              0           0           0',
        ].join('\n'),
      };
    }

    case 'pkg': {
      const sub = args[0]?.toLowerCase();
      const pkgStore = usePackageStore.getState();

      if (!sub || sub === 'list') {
        const header = 'PACKAGE ID          VERSION  STATUS      NAME';
        const lines = pkgStore.packages.map(
          (p) =>
            `${p.id.padEnd(19)} ${p.version.padEnd(8)} ${(p.installed ? '[INSTALLED]' : '[AVAILABLE]').padEnd(11)} ${p.name}`
        );
        return { output: [header, ...lines].join('\n') };
      }

      if (sub === 'install') {
        const target = args[1];
        if (!target) return { output: 'pkg install: missing package name' };
        const ok = pkgStore.installPackage(target);
        return {
          output: ok
            ? `Successfully installed ${target}. Shortcut pinned to Dock.`
            : `pkg: failed to install '${target}'. Package not found or already installed.`,
        };
      }

      if (sub === 'remove' || sub === 'uninstall') {
        const target = args[1];
        if (!target) return { output: 'pkg remove: missing package name' };
        const ok = pkgStore.uninstallPackage(target);
        return {
          output: ok
            ? `Successfully uninstalled ${target}.`
            : `pkg: package '${target}' is not installed.`,
        };
      }

      return {
        output: 'Usage: pkg [list | install <name> | remove <name> | search <query>]',
      };
    }

    case 'clear':
    case 'cls':
      return { output: '' };

    default:
      return {
        output: `onyxsh: command not found: ${command}. Type 'help' for available commands.`,
      };
  }
}
