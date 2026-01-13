'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import LedGrid from './led-grid';
import ControlPanel from './control-panel';
import { patterns, type PatternFunction } from '@/lib/patterns';

const GRID_COLS = 24;
const GRID_ROWS = 32;

const createInitialGrid = (): string[][] => {
  return Array(GRID_ROWS).fill(Array(GRID_COLS).fill('#000000'));
};

export default function GlowMotionApp() {
  const [isClient, setIsClient] = useState(false);
  const [gridData, setGridData] = useState<string[][]>(createInitialGrid);
  const [colors, setColors] = useState<string[]>([
    '#7DF9FF', '#7FFFD4', '#FF7F50', '#FF00FF', '#FFFF00', '#00FFFF'
  ]);
  const [speed, setSpeed] = useState<number>(20);
  const [selectedPattern, setSelectedPattern] = useState<string>(patterns[0].id);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const animationFrameId = useRef<number>();
  const appContainerRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const patternFuncRef = useRef<PatternFunction>(patterns[0].func);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    const newPattern = patterns.find((p) => p.id === selectedPattern);
    if (newPattern) {
      patternFuncRef.current = newPattern.func;
    }
  }, [selectedPattern]);

  const animate = useCallback((time: number) => {
    const t = time * (speed / 1000);
    const newGridData = Array.from({ length: GRID_ROWS }, (_, i) =>
      Array.from({ length: GRID_COLS }, (_, j) =>
        patternFuncRef.current(j, i, t, GRID_COLS, GRID_ROWS, colors)
      )
    );
    setGridData(newGridData);
    animationFrameId.current = requestAnimationFrame(animate);
  }, [speed, colors]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate]);

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
        // Silently fail if wake lock is not available.
        // This is not a critical feature.
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
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
    <div ref={appContainerRef} className="h-screen w-screen bg-background">
      <LedGrid gridData={gridData} />
      <ControlPanel
        colors={colors}
        setColors={setColors}
        speed={speed}
        setSpeed={setSpeed}
        selectedPattern={selectedPattern}
        setSelectedPattern={setSelectedPattern}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
