"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface RtBin {
  binRange: string;
  minMs: number;
  maxMs: number;
  count: number;
  percent: number;
}

export function ReactionTimeHistogram({ data }: { data: RtBin[] }) {
  return (
    <div className="w-full h-[240px] lg:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="binRange"
            stroke="#697386"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <YAxis
            stroke="#697386"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as RtBin;
                return (
                  <div className="glass-panel-elevated p-2.5 rounded-lg border border-white/15 text-xs">
                    <p className="font-semibold text-white font-mono">{label}</p>
                    <p className="text-[#4F8CFF] font-medium mt-1">
                      {item.count} trials ({item.percent}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="count"
            fill="#4F8CFF"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
