"use client";

import React, { useEffect, useState } from "react";

export function LiveSparkline({
  initialValue = 412,
  unit = "ms",
}: {
  initialValue?: number;
  unit?: string;
}) {
  const [currentVal, setCurrentVal] = useState(initialValue);
  const [points, setPoints] = useState<number[]>([425, 418, 430, 415, 408, 412]);

  useEffect(() => {
    // Subtle live telemetry pulse every 3 seconds to communicate active research instrument
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 12;
      const nextVal = Math.round(Math.max(340, Math.min(480, currentVal + delta)));
      setCurrentVal(nextVal);
      setPoints((prev) => [...prev.slice(1), nextVal]);
    }, 3200);

    return () => clearInterval(interval);
  }, [currentVal]);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const svgPoints = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]" />
        <span className="text-[10px] font-mono uppercase text-[#A5ADBD] tracking-wider">
          LIVE RT
        </span>
      </div>

      <div className="flex items-baseline gap-1 font-mono font-semibold text-white text-sm">
        <span>{currentVal}</span>
        <span className="text-[10px] text-[#A5ADBD] font-normal">{unit}</span>
      </div>

      <svg width={width} height={height} className="overflow-visible opacity-80">
        <polyline
          fill="none"
          stroke="#4F8CFF"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={svgPoints}
        />
        <circle
          cx={width}
          cy={height - ((points[points.length - 1] - min) / range) * (height - 4) - 2}
          r="3"
          fill="#4F8CFF"
          className="animate-ping"
        />
      </svg>
    </div>
  );
}
