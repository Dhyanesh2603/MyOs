import React, { useState } from 'react';
import { CloudSun, Sun, Wind, Droplets, MapPin } from 'lucide-react';

interface WeatherWidgetProps {
  id?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = () => {
  const [isCelsius, setIsCelsius] = useState(false);

  // Realistic mock telemetry conditions
  const tempF = 72;
  const tempC = Math.round(((tempF - 32) * 5) / 9);
  const displayTemp = isCelsius ? `${tempC}°C` : `${tempF}°F`;

  return (
    <div className="flex w-64 flex-col rounded-xl border border-border-subtle bg-surface-panel/85 p-3.5 shadow-lg backdrop-blur-md text-content-primary select-none transition-all hover:border-border-strong">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-content-secondary">
          <MapPin className="h-3 w-3 text-sky-400" />
          <span>SAN FRANCISCO</span>
        </div>
        <button
          onClick={() => setIsCelsius((prev) => !prev)}
          className="font-mono text-[9px] text-content-tertiary hover:text-content-primary transition-colors"
        >
          {isCelsius ? 'SWITCH TO °F' : 'SWITCH TO °C'}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-3xl font-light tracking-tight text-content-primary">
            {displayTemp}
          </span>
          <span className="text-[11px] font-medium text-sky-400">
            Partly Cloudy
          </span>
        </div>

        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
          <Sun className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-spin-slow" />
          <CloudSun className="h-8 w-8" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2 font-mono text-[10px] text-content-secondary">
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-content-tertiary" />
          <span>8 mph NW</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-sky-400/80" />
          <span>54% Humidity</span>
        </div>
      </div>
    </div>
  );
};
