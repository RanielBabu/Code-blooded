"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface LineChartDataPoint {
  trial: number;
  avgRt: number;
  textRt?: number;
  colorRt?: number;
  imageRt?: number;
  accuracy?: number;
}

interface ReactionTimeLineChartProps {
  data: LineChartDataPoint[];
  showStimulusToggles?: boolean;
  benchmarkLine?: number;
}

export function ReactionTimeLineChart({
  data,
  showStimulusToggles = true,
  benchmarkLine = 412,
}: ReactionTimeLineChartProps) {
  const [activeSeries, setActiveSeries] = useState({
    avg: true,
    text: true,
    color: true,
    image: true,
  });

  const toggleSeries = (key: keyof typeof activeSeries) => {
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = data.map((d) => ({
    ...d,
    trialLabel: `T${d.trial}`,
  }));

  return (
    <div className="w-full flex flex-col h-full">
      {/* Interactive Legend / Filter Controls */}
      {showStimulusToggles && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSeries("avg")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                activeSeries.avg
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-transparent text-[#697386]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              <span>Overall Mean</span>
            </button>

            <button
              onClick={() => toggleSeries("text")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                activeSeries.text
                  ? "bg-[#4F8CFF]/15 border-[#4F8CFF]/30 text-[#60A5FA]"
                  : "bg-transparent border-transparent text-[#697386]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F8CFF] shadow-[0_0_8px_#4F8CFF]" />
              <span>Text</span>
            </button>

            <button
              onClick={() => toggleSeries("color")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                activeSeries.color
                  ? "bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#A78BFA]"
                  : "bg-transparent border-transparent text-[#697386]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6]" />
              <span>Color</span>
            </button>

            <button
              onClick={() => toggleSeries("image")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all ${
                activeSeries.image
                  ? "bg-[#22D3EE]/15 border-[#22D3EE]/30 text-[#22D3EE]"
                  : "bg-transparent border-transparent text-[#697386]"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
              <span>Image</span>
            </button>
          </div>

          <div className="text-[11px] text-[#A5ADBD] flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-[#F59E0B]" />
            <span>Benchmark: {benchmarkLine} ms</span>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full h-[280px] lg:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis
              dataKey="trialLabel"
              stroke="#697386"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            />
            <YAxis
              stroke="#697386"
              fontSize={11}
              unit=" ms"
              domain={["dataMin - 40", "dataMax + 40"]}
              tickLine={false}
              axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel-elevated p-3 rounded-lg border border-white/15 shadow-xl text-xs space-y-1.5 min-w-[140px]">
                      <p className="font-semibold text-white border-b border-white/10 pb-1 font-mono">
                        Trial {label}
                      </p>
                      {payload.map((entry: any) => (
                        <div key={entry.name} className="flex justify-between items-center gap-3">
                          <span className="text-[#A5ADBD] flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:
                          </span>
                          <span className="font-mono font-medium text-white">
                            {Math.round(entry.value)} ms
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            {benchmarkLine && (
              <ReferenceLine
                y={benchmarkLine}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
            )}

            {activeSeries.avg && (
              <Line
                type="monotone"
                dataKey="avgRt"
                name="Overall Mean"
                stroke="#FFFFFF"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: "#05060A", stroke: "#FFFFFF", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#FFFFFF", stroke: "#4F8CFF", strokeWidth: 2 }}
              />
            )}
            {activeSeries.text && (
              <Line
                type="monotone"
                dataKey="textRt"
                name="Text"
                stroke="#4F8CFF"
                strokeWidth={1.8}
                dot={{ r: 3, fill: "#05060A", stroke: "#4F8CFF", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#4F8CFF" }}
              />
            )}
            {activeSeries.color && (
              <Line
                type="monotone"
                dataKey="colorRt"
                name="Color"
                stroke="#8B5CF6"
                strokeWidth={1.8}
                dot={{ r: 3, fill: "#05060A", stroke: "#8B5CF6", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#8B5CF6" }}
              />
            )}
            {activeSeries.image && (
              <Line
                type="monotone"
                dataKey="imageRt"
                name="Image"
                stroke="#22D3EE"
                strokeWidth={1.8}
                dot={{ r: 3, fill: "#05060A", stroke: "#22D3EE", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#22D3EE" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
