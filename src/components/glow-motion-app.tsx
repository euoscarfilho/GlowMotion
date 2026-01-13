'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import LedGrid from './led-grid';
import ControlPanel from './control-panel';
import { patterns, type PatternFunction } from '@/lib/patterns';

const HIGH_RES_COLS = 128;
const HIGH_RES_ROWS = 96;
const LOW_RES_COLS = 64;
const LOW_RES_ROWS = 48;

const createInitialGrid = (rows: number, cols: number): string[][] => {
  return Array(rows).fill(Array(cols).fill('#000000'));
};

export default function GlowMotionApp() {
  const [isClient, setIsClient] = useState(false);
  const [gridCols, setGridCols] = useState(HIGH_RES_COLS);
  const [gridRows, setGridRows] = useState(HIGH_RES_ROWS);
  const [gridData, setGridData] = useState<string[][]>(() => createInitialGrid(HIGH_RES_ROWS, HIGH_RES_COLS));
  const [colors, setColors] = useState<string[]>([
    '#0000FF', '#FF0000', '#FFFF00', '#FF69B4', '#00FF00', '#FFFFFF'
  ]);
  const [speed, setSpeed] = useState<number>(20);
  const [selectedPattern, setSelectedPattern] = useState<string>('solid-color');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  const animationFrameId = useRef<number>();
  const appContainerRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const patternFuncRef = useRef<PatternFunction>(patterns.find(p => p.id === 'solid-color')!.func);
  const timeRef = useRef(0);
  const initialColorsRef = useRef([...colors]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    const newPattern = patterns.find((p) => p.id === selectedPattern);
    if (newPattern) {
      patternFuncRef.current = newPattern.func;
      if (newPattern.id === 'solid-color') {
        setIsAnimationEnabled(false);
        setGridCols(HIGH_RES_COLS);
        setGridRows(HIGH_RES_ROWS);
      } else {
        setIsAnimationEnabled(true);
        setGridCols(LOW_RES_COLS);
        setGridRows(LOW_RES_ROWS);
      }
    }
  }, [selectedPattern]);

  const animate = useCallback((timestamp: number) => {
    if (isAnimationEnabled) {
      timeRef.current = timestamp;
      const t = timestamp * (speed / 1000);
      const newGridData = Array.from({ length: gridRows }, (_, i) =>
        Array.from({ length: gridCols }, (_, j) =>
          patternFuncRef.current(j, i, t, gridCols, gridRows, colors)
        )
      );
      setGridData(newGridData);
    }
    animationFrameId.current = requestAnimationFrame(animate);
  }, [speed, colors, isAnimationEnabled, gridCols, gridRows]);

  useEffect(() => {
    if (isAnimationEnabled) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      // When pausing or for solid color, render a static frame
      const t = timeRef.current * (speed / 1000);
      const newGridData = Array.from({ length: gridRows }, (_, i) =>
        Array.from({ length: gridCols }, (_, j) =>
          patternFuncRef.current(j, i, t, gridCols, gridRows, colors)
        )
      );
      setGridData(newGridData);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, isAnimationEnabled, speed, colors, selectedPattern, gridCols, gridRows]);

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  const toggleFullscreen = async () => {
    if (!appContainerRef.current) return;

    if (!document.fullscreenElement) {
      await appContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Silently fail if wake lock is not available or permission is denied.
        // This is not a critical feature.
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleScreenDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent color change if the click is on the control panel
    if ((e.target as HTMLElement).closest('.fixed.bottom-0')) {
      return;
    }
    
    if (selectedPattern === 'solid-color') {
      setColors(prevColors => {
        const currentFirstColor = prevColors[0];
        let currentIndex = initialColorsRef.current.indexOf(currentFirstColor);
        if (currentIndex === -1) {
          currentIndex = 0; 
        }
        const nextIndex = (currentIndex + 1) % initialColorsRef.current.length;
        const nextColor = initialColorsRef.current[nextIndex];
        return [nextColor, ...initialColorsRef.current.filter(c => c !== nextColor)];
      });
    }
  };


  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);

  if (!isClient) {
    return <div className="absolute inset-0 bg-background" />;
  }

  return (
    <div ref={appContainerRef} className="h-screen w-screen bg-background" onDoubleClick={handleScreenDoubleClick}>
      <LedGrid gridData={gridData} style={{ filter: `brightness(${brightness})` }}/>
      <ControlPanel
        colors={colors}
        setColors={setColors}
        speed={speed}
        setSpeed={setSpeed}
        selectedPattern={selectedPattern}
        setSelectedPattern={setSelectedPattern}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        brightness={brightness}
        setBrightness={setBrightness}
        isAnimationEnabled={isAnimationEnabled}
        setIsAnimationEnabled={setIsAnimationEnabled}
      />
    </div>
  );
}
