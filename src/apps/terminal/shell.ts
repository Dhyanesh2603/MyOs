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
  SHELL: '/bin/flowsh',
  PATH: '/bin:/usr/bin:/usr/local/bin',
  TERM: 'xterm-256color',
  OS: 'FlowOS',
  ARCH: 'x86_64-synthetic-wasm',
};

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
  const parts = segment.trim().split(/\s+/);
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
  cwd: string
): Promise<ShellResult> {
  const trimmed = input.trim();
  if (!trimmed) return { output: '' };

  // ── Redirection Check (> or >>) ──────────────────────────────────────────
  if (trimmed.includes('>>')) {
    const [cmdPart, destPart] = trimmed.split('>>');
    if (cmdPart && destPart) {
      const dest = destPart.trim();
      const res = await executeCommand(cmdPart.trim(), cwd);
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
      const res = await executeCommand(cmdPart.trim(), cwd);
      const destPath = dest.startsWith('/') ? dest : normalizePath(`${cwd}/${dest}`);
      await vfs.writeFile(destPath, res.output);
      return { output: '', newCwd: res.newCwd };
    }
  }

  // ── Pipeline detection ────────────────────────────────────────────────────
  const segments = splitPipeline(trimmed);
  if (segments.length > 1) {
    const firstSegment = segments[0] ?? '';
    const firstResult = await executeCommand(firstSegment, cwd);
    let piped = firstResult.output;
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i];
      if (seg) {
        piped = applyFilter(piped, seg);
      }
    }
    return { output: piped, newCwd: firstResult.newCwd };
  }

  const [cmd, ...args] = trimmed.split(/\s+/);
  const command = cmd?.toLowerCase() ?? '';

  switch (command) {
    case 'help':
      return {
        output: [
          'FlowOS Shell v0.4.0 — Full Unix & Device Pipeline Edition',
          '────────────────────────────────────────────────────────',
          'File System:',
          '  pwd                   Print current working directory',
          '  ls [path]             List directory contents',
          '  cd <path>             Change directory',
          '  cat <file>            Print file contents',
          '  cp <src> <dst>        Copy file',
          '  mv <src> <dst>        Move or rename file',
          '  rm <path>             Delete file or directory',
          '  touch <file>          Create an empty file',
          '  mkdir <dir>           Create a directory',
          '  tree [path]           Visual directory tree',
          '  find [path] [query]   Find files matching query',
          '',
          'Device & Host Storage:',
          '  device                List mounted physical PC folders',
          '  device mount          Mount local computer folder via File System API',
          '  mount                 Show mounted file systems',
          '',
          'Text Processing & Redirection:',
          '  echo <text>           Print text (supports > and >> file redirection)',
          '  grep <pat> [file]     Filter lines matching regex/text',
          '  wc [-l|-w|-c] [file]  Count lines / words / chars',
          '  head [n] [file]       First N lines (default 10)',
          '  tail [n] [file]       Last N lines (default 10)',
          '  sort [file]           Sort lines alphabetically',
          '  uniq [file]           Remove consecutive duplicates',
          '  tr <from> <to>        Translate characters',
          '',
          'Network & Utilities:',
          '  ping <host>           Simulate ICMP ping with latency statistics',
          '  curl <url>            Fetch public API or web page text',
          '  calc <expr>           Evaluate math arithmetic (e.g. calc 45*12)',
          '  date                  Display current system date and time',
          '  uptime                Display OS uptime',
          '  whoami                Display current user',
          '  hostname              Display system hostname',
          '  uname [-a]            Display OS architecture and kernel details',
          '  which <cmd>           Locate command path',
          '  env                   Print environment variables',
          '  export KEY=VAL        Set environment variable',
          '  open <path>           Open file in system app',
          '',
          'Runtime & Processes:',
          '  eval <js>             Evaluate JavaScript expression',
          '  run <file>            Execute a .js file from VFS',
          '  ps                    List active OS processes',
          '  kill <pid>            Terminate a process by ID',
          '  pkg [cmd]             Package manager (list/install/remove/search)',
          '  clear                 Clear terminal screen',
        ].join('\n'),
      };

    case 'pwd':
      return { output: cwd };

    case 'whoami':
      return { output: envVars['USER'] || 'user' };

    case 'hostname':
      return { output: 'flowos-desktop' };

    case 'uname': {
      if (args[0] === '-a' || args[0] === '-all') {
        return {
          output: `FlowOS flowos-desktop 6.10.0-flow #1 SMP PREEMPT 2026 x86_64 synthetic-wasm GNU/Linux`,
        };
      }
      return { output: 'FlowOS' };
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

    case 'which': {
      const target = args[0];
      if (!target) return { output: 'which: missing command operand' };
      return { output: `/bin/${target}` };
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
        // Evaluate safe arithmetic
        const sanitized = expr.replace(/[^0-9+\-*/().%^eE ]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${sanitized})`)();
        return { output: `${expr} = ${result}` };
      } catch {
        return { output: 'calc: syntax error in expression' };
      }
    }

    case 'ls': {
      const targetPath = args[0]
        ? args[0].startsWith('/')
          ? args[0]
          : normalizePath(`${cwd}/${args[0]}`)
        : cwd;

      try {
        const nodes = await vfs.readDir(targetPath);
        if (nodes.length === 0) return { output: '(empty directory)' };

        const lines = nodes.map((n) => {
          const typeIndicator = n.type === 'directory' ? '/' : '';
          const sizeStr = n.type === 'directory' ? '<DIR>' : `${n.size}B`;
          return `${sizeStr.padEnd(8)} ${n.name}${typeIndicator}`;
        });

        return { output: lines.join('\n') };
      } catch {
        return { output: `ls: cannot access '${targetPath}': No such directory` };
      }
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
        'idb://flowos_vfs      IndexedDB       /',
        'procfs                Virtual         /proc',
        ...devStore.mountedFolders.map((f) => `host://local-fs       FileSysAccess   ${f.vfsPath}`),
      ];
      return { output: [header, ...rows].join('\n') };
    }

    case 'df': {
      return {
        output: [
          'Filesystem       1K-blocks      Used Available Use% Mounted on',
          'idb://flowos_vfs  10485760    142850  10342910   2% /',
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

    case 'open': {
      const target = args[0];
      if (!target) return { output: 'open: missing file operand' };
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

    case 'cd': {
      const target = args[0];
      if (!target || target === '~') {
        return { output: '', newCwd: '/home/user' };
      }

      if (target === '..') {
        const parts = cwd.split('/').filter(Boolean);
        parts.pop();
        const next = '/' + parts.join('/');
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

      return { output: '', newCwd: targetPath };
    }

    case 'cat': {
      const target = args[0];
      if (!target) return { output: 'cat: missing file operand' };

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      try {
        const content = await vfs.readFile(targetPath);
        return { output: content };
      } catch {
        return { output: `cat: ${target}: No such file or directory` };
      }
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
      const target = args[0];
      if (!target) return { output: 'mkdir: missing operand' };

      const targetPath = target.startsWith('/')
        ? target
        : normalizePath(`${cwd}/${target}`);

      await vfs.mkdir(targetPath);
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

    case 'run':
    case 'node': {
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

      if (sub === 'search') {
        const q = args.slice(1).join(' ').toLowerCase();
        const matches = pkgStore.packages.filter(
          (p) =>
            p.id.includes(q) ||
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
        if (matches.length === 0) return { output: `No packages matching '${q}'.` };
        return {
          output: matches
            .map(
              (m) =>
                `${m.id} (${m.name}) - ${m.description} [${m.installed ? 'Installed' : 'Available'}]`
            )
            .join('\n'),
        };
      }

      return {
        output: 'Usage: pkg [list | install <name> | remove <name> | search <query>]',
      };
    }

    default:
      return {
        output: `flowsh: command not found: ${command}. Type 'help' for available commands.`,
      };
  }
}
