'use client';

import {
  Maximize,
  Minimize,
  Palette,
  Pause,
  Play,
  Settings2,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { patterns } from '@/lib/patterns';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { AiPaletteSuggester } from './ai-palette-suggester';
import { Separator } from './ui/separator';

type ControlPanelProps = {
  colors: string[];
  setColors: (colors: string[]) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  selectedPattern: string;
  setSelectedPattern: (pattern: string) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  brightness: number;
  setBrightness: (brightness: number) => void;
  isAnimationEnabled: boolean;
  setIsAnimationEnabled: (enabled: boolean) => void;
};

export default function ControlPanel({
  colors,
  setColors,
  speed,
  setSpeed,
  selectedPattern,
  setSelectedPattern,
  isFullscreen,
  toggleFullscreen,
  brightness,
  setBrightness,
  isAnimationEnabled,
  setIsAnimationEnabled,
}: ControlPanelProps) {
  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };
  
  const isSolidColorMode = selectedPattern === 'solid-color';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex h-auto w-full items-center justify-center p-4">
      <div className="flex w-full max-w-lg items-center gap-2 rounded-lg border bg-card/80 p-2 shadow-lg backdrop-blur-sm md:gap-4 md:p-3">
        {/* Pattern Select */}
        <Select value={selectedPattern} onValueChange={setSelectedPattern}>
          <SelectTrigger className="w-[130px] flex-shrink-0 md:w-[150px]">
            <Settings2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline"><SelectValue placeholder="Pattern" /></span>
          </SelectTrigger>
          <SelectContent>
            {patterns.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Adjustments Popover (Speed & Brightness) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-4">
              <div>
                <Label htmlFor="speed" className="text-sm font-medium">Velocidade</Label>
                <Slider
                  id="speed"
                  min={1}
                  max={100}
                  step={1}
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  disabled={!isAnimationEnabled}
                  className="mt-2"
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="brightness" className="text-sm font-medium">Brilho</Label>
                <Slider
                  id="brightness"
                  min={0.2}
                  max={1.5}
                  step={0.05}
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  className="mt-2"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Color Palette Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="space-y-4">
              <Label className="text-sm font-medium">{isSolidColorMode ? 'Cor' : 'Paleta de Cores'}</Label>
              <div className="flex items-center gap-2">
                {isSolidColorMode ? (
                  <div className="relative h-8 w-8">
                    <input
                      type="color"
                      value={colors[0]}
                      onChange={(e) => handleColorChange(0, e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                      aria-label="Color 1"
                    />
                  </div>
                ) : (
                  <>
                    {colors.map((color, index) => (
                      <div key={index} className="relative h-8 w-8">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                          aria-label={`Color ${index + 1}`}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
              {!isSolidColorMode && <AiPaletteSuggester onPaletteSuggested={setColors} />}
            </div>
          </PopoverContent>
        </Popover>

        {/* Animation Toggle */}
        <Button
          onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          {isAnimationEnabled ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isAnimationEnabled ? 'Pause Animation' : 'Play Animation'}
          </span>
        </Button>

        {/* Fullscreen Toggle */}
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="icon"
          className="flex-shrink-0"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </span>
        </Button>
      </div>
    </div>
  );
}
