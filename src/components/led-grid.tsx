'use client';

import { memo } from 'react';

type LedGridProps = {
  gridData: string[][];
};

const LedGrid = memo(function LedGrid({ gridData }: LedGridProps) {
  return (
    <div
      className="absolute inset-0 grid h-full w-full"
      style={{
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
