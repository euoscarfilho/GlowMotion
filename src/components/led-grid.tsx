'use client';

import { memo } from 'react';

type LedGridProps = {
  gridData: string[][];
  style?: React.CSSProperties;
};

const LedGrid = memo(function LedGrid({ gridData, style }: LedGridProps) {
  return (
    <div
      className="absolute inset-0 grid h-full w-full transition-opacity duration-200"
      style={{
        ...style,
        gridTemplateColumns: `repeat(${gridData[0]?.length || 1}, 1fr)`,
        gridTemplateRows: `repeat(${gridData.length || 1}, 1fr)`,
        gap: '1px',
      }}
    >
      {gridData.map((row, i) =>
        row.map((color, j) => (
          <div
            key={`${i}-${j}`}
            className="transition-colors duration-100"
            style={{ backgroundColor: color, willChange: 'background-color' }}
            aria-hidden="true"
          />
        ))
      )}
    </div>
  );
});

export default LedGrid;
