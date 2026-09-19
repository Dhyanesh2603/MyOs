import { usePersonalOsStore } from '@core/personal-os/personalOsStore';
import { useScratchpadStore } from '@core/scratchpad/scratchpadStore';

export interface SpotlightDevResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'dev' | 'calc' | 'convert' | 'slash';
  copyValue?: string;
  actionLabel?: string;
  onExecute?: () => void;
}

export function evaluateSpotlightQuery(raw: string): SpotlightDevResult[] {
  const query = raw.trim();
  if (!query) return [];

  const results: SpotlightDevResult[] = [];

  // 1. Slash Commands (/deepwork, /mission, /priority, /scratch)
  if (query.startsWith('/')) {
    const parts = query.slice(1).trim().split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const rest = parts.slice(1).join(' ');

    if (command === 'deepwork' || command === 'focus') {
      const minutes = parseInt(rest, 10) || 25;
      results.push({
        id: 'slash-deepwork',
        title: `Start Deep Work: ${minutes} Minutes`,
        subtitle: `Launch distraction-free Focus Mode with ${minutes}m timer`,
        category: 'slash',
        actionLabel: '↵ Start Focus',
        onExecute: () => {
          usePersonalOsStore.getState().startFocusMode('Deep Work Sprint', minutes);
        },
      });
    }

    if (command === 'mission') {
      const title = rest.replace(/^add\s+/i, '').trim();
      if (title) {
        results.push({
          id: 'slash-mission',
          title: `Create Mission: "${title}"`,
          subtitle: `Add new high-priority mission into Flow Personal OS`,
          category: 'slash',
          actionLabel: '↵ Create Mission',
          onExecute: () => {
            usePersonalOsStore.getState().addMission(title, 'Initialized via Spotlight');
          },
        });
      }
    }

    if (command === 'priority') {
      const title = rest.replace(/^add\s+/i, '').trim();
      if (title) {
        results.push({
          id: 'slash-priority',
          title: `Add Morning Priority: "${title}"`,
          subtitle: `Pin to Today's Focus in Personal OS Home Momentum`,
          category: 'slash',
          actionLabel: '↵ Add Priority',
          onExecute: () => {
            usePersonalOsStore.getState().addMorningPriority(title, 'CORE');
          },
        });
      }
    }

    if (command === 'scratch') {
      if (rest) {
        results.push({
          id: 'slash-scratch',
          title: `Append to Scratchpad: "${rest}"`,
          subtitle: `Add note directly into quick scratchpad drawer`,
          category: 'slash',
          actionLabel: '↵ Append',
          onExecute: () => {
            const current = useScratchpadStore.getState().scratchText;
            useScratchpadStore.getState().setScratchText(`${current}\n- [ ] ${rest}`);
            useScratchpadStore.getState().setOpen(true);
          },
        });
      }
    }

    if (results.length > 0) return results;
  }

  // 2. Developer Base64 Encodings
  const b64EncodeMatch = query.match(/^b64\s+encode\s+(.+)$/i);
  if (b64EncodeMatch && b64EncodeMatch[1]) {
    try {
      const encoded = btoa(b64EncodeMatch[1]);
      results.push({
        id: 'dev-b64-encode',
        title: encoded,
        subtitle: `Base64 Encoded • Source: "${b64EncodeMatch[1]}"`,
        category: 'dev',
        copyValue: encoded,
        actionLabel: '↵ Copy Base64',
      });
    } catch {
      // ignore
    }
  }

  const b64DecodeMatch = query.match(/^b64\s+decode\s+(.+)$/i);
  if (b64DecodeMatch && b64DecodeMatch[1]) {
    try {
      const decoded = atob(b64DecodeMatch[1]);
      results.push({
        id: 'dev-b64-decode',
        title: decoded,
        subtitle: `Base64 Decoded • Source: "${b64DecodeMatch[1]}"`,
        category: 'dev',
        copyValue: decoded,
        actionLabel: '↵ Copy Decoded',
      });
    } catch {
      // ignore
    }
  }

  // 3. UUID Generator
  if (/^(uuid|guid)$/i.test(query)) {
    const newUuid = crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    results.push({
      id: 'dev-uuid',
      title: newUuid,
      subtitle: `v4 Crypto UUID Generated`,
      category: 'dev',
      copyValue: newUuid,
      actionLabel: '↵ Copy UUID',
    });
  }

  // 4. Unix Timestamp / Epoch
  if (/^(timestamp|epoch|now|time\s+now)$/i.test(query)) {
    const ms = Date.now();
    const sec = Math.floor(ms / 1000);
    const iso = new Date(ms).toISOString();
    results.push({
      id: 'dev-timestamp-sec',
      title: `${sec} (Seconds)`,
      subtitle: `Unix Epoch Timestamp • ISO: ${iso}`,
      category: 'dev',
      copyValue: String(sec),
      actionLabel: '↵ Copy Seconds',
    });
    results.push({
      id: 'dev-timestamp-ms',
      title: `${ms} (Milliseconds)`,
      subtitle: `High-resolution epoch ms`,
      category: 'dev',
      copyValue: String(ms),
      actionLabel: '↵ Copy Milliseconds',
    });
  }

  // 5. Binary & Hex conversions
  const hexMatch = query.match(/^(?:hex|tohex)\s+(\d+)$/i);
  if (hexMatch && hexMatch[1]) {
    const num = parseInt(hexMatch[1], 10);
    if (!isNaN(num)) {
      const hexVal = `0x${num.toString(16).toUpperCase()}`;
      results.push({
        id: 'dev-hex',
        title: hexVal,
        subtitle: `Hexadecimal value of ${num}`,
        category: 'dev',
        copyValue: hexVal,
        actionLabel: '↵ Copy Hex',
      });
    }
  }

  const binMatch = query.match(/^(?:bin|tobin|binary)\s+(\d+)$/i);
  if (binMatch && binMatch[1]) {
    const num = parseInt(binMatch[1], 10);
    if (!isNaN(num)) {
      const binVal = `0b${num.toString(2)}`;
      results.push({
        id: 'dev-bin',
        title: binVal,
        subtitle: `Binary bit-representation of ${num}`,
        category: 'dev',
        copyValue: binVal,
        actionLabel: '↵ Copy Binary',
      });
    }
  }

  // 6. CSS & Unit Conversions
  // px in rem
  const pxInRem = query.match(/^(\d+(?:\.\d+)?)\s*px\s+in\s+rem$/i);
  if (pxInRem && pxInRem[1]) {
    const px = parseFloat(pxInRem[1]);
    const rem = (px / 16).toFixed(4).replace(/\.?0+$/, '');
    results.push({
      id: 'convert-px-rem',
      title: `${rem}rem`,
      subtitle: `${px}px in REM (assuming root 16px font-size)`,
      category: 'convert',
      copyValue: `${rem}rem`,
      actionLabel: '↵ Copy REM',
    });
  }

  // rem in px
  const remInPx = query.match(/^(\d+(?:\.\d+)?)\s*rem\s+in\s+px$/i);
  if (remInPx && remInPx[1]) {
    const rem = parseFloat(remInPx[1]);
    const px = (rem * 16).toFixed(2).replace(/\.?0+$/, '');
    results.push({
      id: 'convert-rem-px',
      title: `${px}px`,
      subtitle: `${rem}rem in pixels (assuming root 16px font-size)`,
      category: 'convert',
      copyValue: `${px}px`,
      actionLabel: '↵ Copy PX',
    });
  }

  // hz in ms (frame budget)
  const hzMatch = query.match(/^(\d+(?:\.\d+)?)\s*hz\s+in\s+ms$/i);
  if (hzMatch && hzMatch[1]) {
    const hz = parseFloat(hzMatch[1]);
    if (hz > 0) {
      const ms = (1000 / hz).toFixed(2).replace(/\.?0+$/, '');
      results.push({
        id: 'convert-hz-ms',
        title: `${ms}ms`,
        subtitle: `${hz} FPS / Hz frame budget per tick`,
        category: 'convert',
        copyValue: `${ms}ms`,
        actionLabel: '↵ Copy ms',
      });
    }
  }

  // bytes in mb/gb
  const bytesMatch = query.match(/^(\d+)\s*bytes\s+in\s+(kb|mb|gb)$/i);
  if (bytesMatch && bytesMatch[1] && bytesMatch[2]) {
    const bytes = parseInt(bytesMatch[1], 10);
    const targetUnit = bytesMatch[2].toLowerCase();
    let divisor = 1024;
    if (targetUnit === 'mb') divisor = 1024 * 1024;
    if (targetUnit === 'gb') divisor = 1024 * 1024 * 1024;

    const val = (bytes / divisor).toFixed(3).replace(/\.?0+$/, '');
    results.push({
      id: 'convert-bytes',
      title: `${val} ${targetUnit.toUpperCase()}`,
      subtitle: `${bytes.toLocaleString()} bytes converted to ${targetUnit.toUpperCase()}`,
      category: 'convert',
      copyValue: `${val} ${targetUnit.toUpperCase()}`,
      actionLabel: `↵ Copy ${targetUnit.toUpperCase()}`,
    });
  }

  // 7. Color Converter (Hex to RGB)
  const hexColorMatch = query.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/);
  if (hexColorMatch) {
    let hex = hexColorMatch[0].slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const rgbStr = `rgb(${r}, ${g}, ${b})`;

    results.push({
      id: 'convert-color-rgb',
      title: rgbStr,
      subtitle: `RGB color conversion for #${hex}`,
      category: 'convert',
      copyValue: rgbStr,
      actionLabel: '↵ Copy RGB',
    });
  }

  return results;
}
