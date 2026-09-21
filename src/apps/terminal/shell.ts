import { vfs, normalizePath } from '@core/vfs/vfsService';
import { useProcessStore } from '@core/process/processStore';
import { executeCode } from '@core/runtime/codeRunner';
import { usePackageStore } from '@core/packages/packageStore';

export interface ShellResult {
  output: string;
  newCwd?: string;
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

// ─── Main command executor ────────────────────────────────────────────────────
export async function executeCommand(
  input: string,
  cwd: string
): Promise<ShellResult> {
  const trimmed = input.trim();
  if (!trimmed) return { output: '' };

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
          'FlowOS Shell v0.3.0  —  Unix Pipeline Edition',
          '─────────────────────────────────────────────',
          'File System:',
          '  pwd                   Print current working directory',
          '  ls [path]             List directory contents',
          '  cd <path>             Change directory',
          '  cat <file>            Print file contents',
          '  tree [path]           Visual directory tree',
          '  touch <file>          Create an empty file',
          '  mkdir <dir>           Create a directory',
          '  rm <path>             Delete file or directory',
          '',
          'Text Processing (pipeline-compatible):',
          '  echo <text>           Print text',
          '  grep <pattern>        Filter lines matching regex/text',
          '  wc [-l|-w|-c]         Count lines / words / chars',
          '  head [n]              First N lines (default 10)',
          '  tail [n]              Last N lines (default 10)',
          '  sort                  Sort lines alphabetically',
          '  uniq                  Remove consecutive duplicates',
          '  tr <from> <to>        Translate characters',
          '',
          'Development:',
          '  eval <js>             Evaluate JavaScript expression',
          '  run <file>            Execute a .js file from VFS',
          '',
          'System:',
          '  ps                    List active OS processes',
          '  kill <pid>            Terminate a process by ID',
          '  pkg [cmd]             Package manager',
          '  clear                 Clear terminal screen',
          '',
          'Pipeline Examples:',
          '  cat notes.txt | grep TODO',
          '  ls | wc -l',
          '  cat log.txt | grep error | wc -l',
          '  ls | sort | head 5',
        ].join('\n'),
      };

    case 'pwd':
      return { output: cwd };

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

    case 'grep':
      return { output: 'grep: no input. Usage: cat <file> | grep <pattern>' };

    case 'wc':
      return { output: 'wc: no input. Usage: cat <file> | wc [-l|-w|-c]' };

    case 'head':
      return { output: 'head: no input. Usage: cat <file> | head [n]' };

    case 'tail':
      return { output: 'tail: no input. Usage: cat <file> | tail [n]' };

    case 'sort':
      return { output: 'sort: no input. Usage: cat <file> | sort' };

    case 'uniq':
      return { output: 'uniq: no input. Usage: cat <file> | uniq' };

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
      const target = args[0];
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
      } catch (err: any) {
        return {
          output: `run: cannot read script '${targetPath}': ${err.message || 'No such file'}`,
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
