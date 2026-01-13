'use client';

import { memo } from 'react';

type LedGridProps = {
  gridData: string[][];
  style?: React.CSSProperties;
};

const LedGrid = memo(function LedGrid({ gridData, style }: LedGridProps) {
  if (!gridData || gridData.length === 0 || gridData[0].length === 0) {
    return null; // Don't render if grid data is invalid
  }

  return (
    <div
      className="absolute inset-0 grid h-full w-full"
      style={{
        ...style,
        gridTemplateColumns: `repeat(${gridData[0].length}, 1fr)`,
        gridTemplateRows: `repeat(${gridData.length}, 1fr)`,
      }}
    >
      {gridData.map((row, i) =>
        row.map((color, j) => (
          <div
            key={`${i}-${j}`}
            style={{ backgroundColor: color, willChange: 'background-color' }}
            aria-hidden="true"
          />
        ))
      )}
    </div>
  );
});

export default LedGrid;
