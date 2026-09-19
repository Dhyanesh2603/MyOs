export interface ExecutionLog {
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

export interface ExecutionResult {
  success: boolean;
  logs: ExecutionLog[];
  returnValue?: any;
  durationMs: number;
  error?: string;
}

function formatArg(arg: any): string {
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

export async function executeCode(code: string, timeoutMs = 4500): Promise<ExecutionResult> {
  const startTime = performance.now();
  const logs: ExecutionLog[] = [];

  const workerScript = `
    const formatArg = ${formatArg.toString()};

    function sendLog(level, args) {
      const message = Array.from(args).map(formatArg).join(' ');
      self.postMessage({ type: 'log', level, message, timestamp: Date.now() });
    }

    console.log = (...args) => sendLog('log', args);
    console.info = (...args) => sendLog('info', args);
    console.warn = (...args) => sendLog('warn', args);
    console.error = (...args) => sendLog('error', args);

    self.onmessage = async (e) => {
      const userCode = e.data.code;
      try {
        // Execute inside sandbox
        const fn = new Function(userCode);
        const result = fn();
        const resolved = await Promise.resolve(result);
        self.postMessage({
          type: 'done',
          returnValue: formatArg(resolved),
        });
      } catch (err) {
        self.postMessage({
          type: 'error',
          error: err && err.stack ? err.stack : String(err),
        });
      }
    };
  `;

  return new Promise((resolve) => {
    let blobUrl: string | null = null;
    let worker: Worker | null = null;
    let timer: number | null = null;
    let isFinished = false;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = null;
      }
    };

    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);

      timer = window.setTimeout(() => {
        if (!isFinished) {
          isFinished = true;
          cleanup();
          resolve({
            success: false,
            logs,
            durationMs: Math.round(performance.now() - startTime),
            error: `Execution timed out after ${timeoutMs}ms (infinite loop protection guard triggered).`,
          });
        }
      }, timeoutMs);

      worker.onmessage = (event) => {
        if (isFinished) return;
        const data = event.data;

        if (data.type === 'log') {
          logs.push({
            level: data.level,
            message: data.message,
            timestamp: data.timestamp,
          });
        } else if (data.type === 'done') {
          isFinished = true;
          const duration = Math.round(performance.now() - startTime);
          cleanup();
          resolve({
            success: true,
            logs,
            returnValue: data.returnValue,
            durationMs: duration,
          });
        } else if (data.type === 'error') {
          isFinished = true;
          const duration = Math.round(performance.now() - startTime);
          cleanup();
          resolve({
            success: false,
            logs,
            durationMs: duration,
            error: data.error,
          });
        }
      };

      worker.onerror = (err) => {
        if (isFinished) return;
        isFinished = true;
        const duration = Math.round(performance.now() - startTime);
        cleanup();
        resolve({
          success: false,
          logs,
          durationMs: duration,
          error: err.message || 'Script runtime worker error',
        });
      };

      worker.postMessage({ code });
    } catch (err: any) {
      cleanup();
      resolve({
        success: false,
        logs,
        durationMs: Math.round(performance.now() - startTime),
        error: err?.message || 'Failed to initialize execution runtime',
      });
    }
  });
}
