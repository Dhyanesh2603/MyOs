import { vfs, normalizePath } from '@core/vfs/vfsService';
import { useProcessStore } from '@core/process/processStore';
import { executeCode } from '@core/runtime/codeRunner';

export interface ShellResult {
  output: string;
  newCwd?: string;
}

export async function executeCommand(
  input: string,
  cwd: string
): Promise<ShellResult> {
  const trimmed = input.trim();
  if (!trimmed) return { output: '' };

  const [cmd, ...args] = trimmed.split(/\s+/);
  const command = cmd?.toLowerCase() ?? '';

  switch (command) {
    case 'help':
      return {
        output: [
          'FlowOS Shell v0.2.0',
          'Available commands:',
          '  help               Show this help guide',
          '  pwd                Print current working directory',
          '  ls [path]          List directory contents',
          '  cd <path>          Change directory',
          '  cat <file>         Print file contents',
          '  touch <file>       Create an empty file',
          '  mkdir <dir>        Create a directory',
          '  rm <path>          Delete file or directory',
          '  echo <text>        Print text',
          '  eval <code>        Evaluate JavaScript expression',
          '  run <file>         Execute a JavaScript file from VFS',
          '  ps                 List active OS processes',
          '  kill <pid>         Terminate a process by ID',
          '  clear              Clear terminal screen',
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
      } catch (err) {
        return { output: `ls: cannot access '${targetPath}': No such directory` };
      }
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
      } catch (err) {
        return { output: `cat: ${target}: No such file or directory` };
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

    case 'echo': {
      return { output: args.join(' ') };
    }

    case 'eval': {
      if (args.length === 0) return { output: 'eval: missing JavaScript expression' };
      const code = args.join(' ');
      const result = await executeCode(code);
      const out: string[] = [];
      result.logs.forEach((l) => out.push(`[${l.level}] ${l.message}`));
      if (result.returnValue !== undefined && result.returnValue !== 'undefined') {
        out.push(`=> ${result.returnValue}`);
      }
      if (result.error) {
        out.push(`Error: ${result.error}`);
      }
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
        if (result.error) {
          out.push(`Runtime Error:\n${result.error}`);
        }
        return { output: out.join('\n') };
      } catch (err: any) {
        return { output: `run: cannot read script '${targetPath}': ${err.message || 'No such file'}` };
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

    default:
      return {
        output: `flowsh: command not found: ${command}. Type 'help' for available commands.`,
      };
  }
}
