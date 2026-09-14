import React from 'react';

export interface SelectionMarqueeProps {
  startPos: { x: number; y: number } | null;
  currentPos: { x: number; y: number } | null;
}

export const SelectionMarquee: React.FC<SelectionMarqueeProps> = ({
  startPos,
  currentPos,
}) => {
  if (!startPos || !currentPos) return null;

  const left = Math.min(startPos.x, currentPos.x);
  const top = Math.min(startPos.y, currentPos.y);
  const width = Math.abs(currentPos.x - startPos.x);
  const height = Math.abs(currentPos.y - startPos.y);

  if (width < 3 && height < 3) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className="pointer-events-none absolute z-[40] rounded-sm border border-accent-primary/60 bg-accent-primary/[0.12] shadow-[0_0_12px_rgba(99,102,241,0.2)] transition-opacity"
    />
  );
};
