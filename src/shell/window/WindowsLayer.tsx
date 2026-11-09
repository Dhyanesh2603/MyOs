import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWindowStore } from '@core/window/windowStore';
import { WindowFrame } from './WindowFrame';

export const WindowsLayer: React.FC = React.memo(() => {
  // Only re-render when windows are created or destroyed, NOT when position/size changes during drag
  const windowIds = useWindowStore(
    useShallow((state) => Object.keys(state.windows))
  );

  return (
    <>
      {windowIds.map((id) => (
        <WindowItem key={id} windowId={id} />
      ))}
    </>
  );
});

WindowsLayer.displayName = 'WindowsLayer';

const WindowItem: React.FC<{ windowId: string }> = React.memo(({ windowId }) => {
  // Only subscribes to this specific window's state
  const windowState = useWindowStore((state) => state.windows[windowId]);
  if (!windowState) return null;
  return <WindowFrame windowState={windowState} />;
});

WindowItem.displayName = 'WindowItem';
